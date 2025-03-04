import {
	Maximize,
	MessageSquare,
	MessageSquareOff,
	Minimize,
	Pause,
	Play,
	Users,
	Volume2,
	VolumeX,
} from "lucide-react";
import {
	useEffect,
	useRef,
	useState,
	type Dispatch,
	type RefObject,
	type SetStateAction,
	type PointerEvent,
	type TouchEvent,
	type ChangeEvent,
} from "react";
import { UserType, type UserState } from "~/types";
import type { Viewer } from "../types";
import { SrsRtcWhipWhepAsync } from "~/lib/SRS";
import ErrorComponent from "./Error";
enum State {
	HOVER = 0,
	IDLE = 1,
}

const TIMEOUT = 2000;

export default function VideoPlayer({
	title,
	userData,
	pageRef,
	hideChat,
	viewers,
	isFullscreen,
	setIsFullscreen,
	setHideChat,
}: {
	title: string;
	userData: UserState;
	pageRef: RefObject<HTMLDivElement>;
	hideChat: boolean;
	viewers: Viewer[];
	isFullscreen: boolean;
	setIsFullscreen: Dispatch<SetStateAction<boolean>>;
	setHideChat: Dispatch<SetStateAction<boolean>>;
}) {
	const ref = useRef<HTMLVideoElement>(null);
	const volumeRef = useRef<HTMLInputElement>(null);
	const controlsRef = useRef<HTMLDivElement>(null);
	const playerRef = useRef<HTMLDivElement>(null);
	const currentTimeout = useRef<NodeJS.Timeout | null>(null);

	const [isPlaying, setIsPlaying] = useState(false);
	const [isMuted, setIsMuted] = useState(true);
	const [state, setState] = useState(State.IDLE);

	const handleHover = (event: PointerEvent<HTMLDivElement>) => {
		if (event.pointerType === "touch") return;
		if (currentTimeout.current !== null) {
			clearTimeout(currentTimeout.current);
		}

		if (state === State.IDLE) {
			setState(State.HOVER);
		}

		const timeout = setTimeout(() => {
			setState(State.IDLE);
		}, TIMEOUT);

		currentTimeout.current = timeout;
	};

	const handleLeave = () => {
		if (currentTimeout.current !== null) {
			clearTimeout(currentTimeout.current);
		}

		setState(State.IDLE);
	};

	const handlePlay = () => {
		if (isPlaying) {
			ref.current?.pause();
			setIsPlaying(false);

			setState(State.HOVER);

			if (currentTimeout.current !== null) {
				clearTimeout(currentTimeout.current);
			}

			const timeout = setTimeout(() => {
				setState(State.IDLE);
			}, TIMEOUT);

			currentTimeout.current = timeout;

			return;
		}

		ref.current?.play();
		setIsPlaying(true);
		setState(State.HOVER);

		if (currentTimeout.current !== null) {
			clearTimeout(currentTimeout.current);
		}

		const timeout = setTimeout(() => {
			setState(State.IDLE);
		}, TIMEOUT);

		currentTimeout.current = timeout;
	};

	const handleTouchDown = (event: TouchEvent<HTMLDivElement>) => {
		if ((event.target as HTMLElement).tagName === "BUTTON") {
			return;
		}

		if (currentTimeout.current !== null) clearTimeout(currentTimeout.current);
		const timeout = setTimeout(() => {
			setState(State.IDLE);
		}, TIMEOUT);
		currentTimeout.current = timeout;

		setState(state === State.HOVER ? State.IDLE : State.HOVER);
	};

	const handleFullScreen = () => {
		if (document.fullscreenElement) {
			document.exitFullscreen();
			screen.orientation.unlock();
			setIsFullscreen(false);
			return;
		}

		pageRef.current?.requestFullscreen();
		setIsFullscreen(true);
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		(screen.orientation as any).lock("landscape");
	};

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const [sdk, setSdk] = useState<any>();

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		sdk?.close();

		if (
			!ref.current ||
			userData.authType !== UserType.OK ||
			!userData.isJoinedServer
		)
			return;

		const videoUrl = `${import.meta.env.VITE_BACKEND_API}/whep/`;

		const initPlayer = async () => {
			if (!ref.current) return;

			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			const player: any = SrsRtcWhipWhepAsync();
			ref.current.srcObject = player.stream;

			setSdk(player);

			try {
				await player.play(
					videoUrl,
					{},
					userData.authType !== UserType.OK ? "" : userData.id,
				);
			} catch (e) {
				player?.close();
				console.error(e);
			}
		};

		initPlayer();

		return () => {
			sdk?.close();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userData?.authType]);

	if (userData.authType === UserType.LOADING) {
		return (
			<div
				className="md:flex-1 relative w-full md:h-full group"
				ref={playerRef}
			/>
		);
	}

	if (userData.authType !== UserType.OK || !userData.isJoinedServer) {
		return (
			<div
				className="md:flex-1 relative w-full md:h-full group"
				ref={playerRef}
			>
				<ErrorComponent />
			</div>
		);
	}

	return (
		<div className="md:flex-1 relative w-full md:h-full group" ref={playerRef}>
			<video
				autoPlay
				muted
				ref={ref}
				className="md:flex-1 md:rounded-xl bg-black h-full w-full"
				onPlay={() => setIsPlaying(true)}
			/>
			<div
				className={"absolute top-0 left-0 w-full h-full focus:outline-none"}
				ref={controlsRef}
				onPointerMove={handleHover}
				onMouseLeave={handleLeave}
				onTouchEnd={handleTouchDown}
				tabIndex={-1}
			>
				<div
					className={`absolute top-0 left-0 w-full h-full md:rounded-xl flex flex-col items-center justify-center player ${state === State.HOVER ? "playerOpen" : ""}`}
					style={{
						backgroundImage:
							"linear-gradient(to bottom, black 0%, transparent 100px, transparent calc(100% - 100px) ,black 100%)",
					}}
				>
					<div className="flex-1 w-full p-5 flex items-start justify-between gap-5">
						<div className="flex flex-col">
							<div className="flex-1 line-clamp-1 font-bold">{title}</div>
							<div className="flex items-center gap-5">
								<button
									type="button"
									// @ts-ignore
									popoverTarget="viewers"
									className="w-full flex gap-2.5 items-center hover:underline underline-offset-2"
								>
									<Users className="pointer-events-none" size={14} />
									<span className="pointer-events-none text-xs">
										{viewers.length} viewer{viewers.length > 1 ? "s" : ""}{" "}
										watching
									</span>
								</button>
							</div>
						</div>

						<button type="button" onClick={() => setHideChat(!hideChat)}>
							{hideChat ? (
								<MessageSquare size={20} className="pointer-events-none" />
							) : (
								<MessageSquareOff size={20} className="pointer-events-none" />
							)}
						</button>
					</div>
					<div
						className={
							"w-full flex flex-col items-center justify-end gap-2 flex-1"
						}
					>
						<div className="w-full flex justify-between items-center">
							<button type="button" onClick={handlePlay} className="p-5">
								{isPlaying ? (
									<Pause
										size={20}
										data-type="button"
										className="pointer-events-none"
									/>
								) : (
									<Play
										size={20}
										data-type="button"
										className="pointer-events-none"
									/>
								)}
							</button>
							<div className="flex items-center">
								<div className="flex items-center gap-2 group/volume p-5 pr-[1px]">
									<button
										type="button"
										onClick={() => {
											if (!ref.current) return;
											ref.current.muted = !ref.current.muted;
											setIsMuted(!isMuted);

											if (!volumeRef.current) return;
											volumeRef.current.value = ref.current.volume.toString();
										}}
									>
										{isMuted ? (
											<VolumeX size={20} className="pointer-events-none" />
										) : (
											<Volume2 size={20} className="pointer-events-none" />
										)}
									</button>
									<div className="group-hover/volume:lg:max-w-lg max-w-0 overflow-hidden transition-all duration-1000 ease-in-out">
										<input
											ref={volumeRef}
											type="range"
											name="volume"
											id="volume"
											className="w-[100px] volumeInput"
											step={0.01}
											min={0}
											max={1}
											defaultValue={ref.current?.volume ?? 0}
											onChange={(event: ChangeEvent<HTMLInputElement>) => {
												if (!ref.current) return;
												ref.current.volume = Number.parseFloat(
													event.target.value,
												);

												if (ref.current.muted) {
													ref.current.muted = false;
													setIsMuted(false);
												}
											}}
										/>
									</div>
								</div>
								<button
									type="button"
									onClick={() => handleFullScreen()}
									className="p-5"
								>
									{isFullscreen ? (
										<Minimize
											size={20}
											data-type="button"
											className="pointer-events-none"
										/>
									) : (
										<Maximize
											size={20}
											data-type="button"
											className="pointer-events-none"
										/>
									)}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
