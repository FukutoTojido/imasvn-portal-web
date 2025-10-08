import Hls from "hls.js";
import {
	Maximize,
	Minimize,
	Pause,
	Play,
	StepBack,
	StepForward,
	Volume2,
	VolumeX,
} from "lucide-react";
import {
	type ChangeEvent,
	type KeyboardEvent,
	type MouseEvent,
	type PointerEvent,
	type TouchEvent,
	useEffect,
	useRef,
	useState,
} from "react";

enum State {
	HOVER = 0,
	IDLE = 1,
}

// import SubtitleOctopus from "~/lib/subtitles-octopus";

const toMinutes = (second: number) => {
	const minutes = Math.floor(second / 60)
		.toString()
		.padStart(2, "0");
	const seconds = Math.floor(second % 60)
		.toString()
		.padStart(2, "0");

	return `${minutes}:${seconds}`;
};

const TIMEOUT = 2000;

export default function VideoPlayer({
	episodeId,
	animeId,
	isStream = false,
	src
}: {
	episodeId?: number;
	animeId?: number;
	isStream?: boolean;
	src?: string;
}) {
	const ref = useRef<HTMLVideoElement>(null);
	const controlsRef = useRef<HTMLDivElement>(null);
	const volumeRef = useRef<HTMLInputElement>(null);
	const playerRef = useRef<HTMLDivElement>(null);
	const barRef = useRef<HTMLDivElement>(null);
	const currentTimeout = useRef<NodeJS.Timeout | null>(null);
	const animationFrame = useRef<number | null>(null);

	const [isPlaying, setIsPlaying] = useState(false);
	const [state, setState] = useState(State.HOVER);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [isMuted, setIsMuted] = useState(false);

	const [isMouseDown, setIsMouseDown] = useState(false);

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

	const handleMouseDown = (
		event: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>,
	) => {
		if (barRef.current === null) return;

		setIsMouseDown(true);
		const rect = barRef.current.getBoundingClientRect();
		const x =
			((event as MouseEvent).clientX ??
				(event as TouchEvent).touches[0].clientX) - rect.left;

		const percentage = x / rect.width;

		if (ref.current === null) return;

		const isPausing = ref.current.paused;
		ref.current.pause();
		ref.current.currentTime = percentage * duration;
		if (!isPausing) ref.current.play();
	};

	const handleMouseUp = () => {
		setIsMouseDown(false);
	};

	const handleMouseMove = (
		event: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>,
	) => {
		if (barRef.current === null) return;
		if (!isMouseDown) return;

		const rect = barRef.current.getBoundingClientRect();
		const x =
			((event as MouseEvent).clientX ??
				(event as TouchEvent).touches[0].clientX) - rect.left;

		const percentage = x / rect.width;

		if (ref.current === null) return;

		// const isPausing = ref.current.paused;
		ref.current.currentTime = percentage * duration;
	};

	const handleSkip = (direction: "Forward" | "Backward") => {
		if (!ref.current) return;
		const isPausing = ref.current.paused;
		ref.current.pause();

		switch (direction) {
			case "Forward": {
				ref.current.currentTime = Math.min(
					ref.current.currentTime + 5,
					duration,
				);
				break;
			}
			case "Backward": {
				ref.current.currentTime = Math.max(ref.current.currentTime - 5, 0);
				break;
			}
		}

		if (!isPausing) ref.current.play();
	};

	const handleTouchDown = (event: TouchEvent<HTMLDivElement>) => {
		if (
			(event.target as HTMLElement).tagName === "BUTTON" ||
			barRef.current?.contains(event.target as Node)
		) {
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
			return;
		}

		playerRef.current?.requestFullscreen();
		// biome-ignore lint/suspicious/noExplicitAny: we don't even know men
		(screen.orientation as any).lock("landscape");
	};

	const getAnimFrame = () => {
		setCurrentTime(ref.current?.currentTime ?? 0);
		const anim = requestAnimationFrame(() => {
			getAnimFrame();
			animationFrame.current = anim;
		});
	};

	const handleKeyPress = (event: KeyboardEvent<HTMLDivElement>) => {
		if (isStream) return;
		switch (event.key) {
			case " ": {
				handlePlay();
				break;
			}
			case "ArrowLeft": {
				handleSkip("Backward");
				break;
			}
			case "ArrowRight": {
				handleSkip("Forward");
				break;
			}
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: only trigger once
	useEffect(() => {
		controlsRef.current?.focus();
		const anim = requestAnimationFrame(() => {
			getAnimFrame();
			animationFrame.current = anim;
		});

		setIsPlaying(false);

		// const options = {
		// 	video: ref.current,
		// 	subUrl: "/ML Ep 1.ass",
		// 	fonts: ["/default.woff2"],
		// 	workerUrl: "/subtitles-octopus-worker.js",
		// 	targetFps: 60,
		// };

		// const instance = new SubtitleOctopus(options);

		if (ref.current && !src) {
			const hls = new Hls({
				xhrSetup: (xhr) => {
					xhr.withCredentials = true;
				},
			});
			hls.attachMedia(ref.current);
			hls.on(Hls.Events.MEDIA_ATTACHED, () => {
				hls.loadSource(
					`${import.meta.env.VITE_BACKEND_API}/anime/${animeId}/episodes/${episodeId}/assets/video.m3u8`,
				);
			});
		}

		if (ref.current) {
			ref.current.volume = +(localStorage.getItem("volume") ?? 1);
		}

		return () => {
			// instance.dispose();

			if (animationFrame.current === null) return;
			cancelAnimationFrame(animationFrame.current);
		};
	}, [animeId, episodeId]);

	return (
		<div className="relative w-full h-full group" ref={playerRef}>
			<video
				className="absolute top-0 left-0 w-full h-full"
				ref={ref}
				onEnded={() => setIsPlaying(false)}
				onLoadedMetadata={() => setDuration(ref.current?.duration ?? 0)}
				src={src}
			>
				<track kind="captions" />
			</video>
			{/** biome-ignore lint/a11y/noStaticElementInteractions: <Ignore this> */}
			<div
				className={"absolute top-0 left-0 w-full h-full focus:outline-none"}
				ref={controlsRef}
				onPointerMove={handleHover}
				onMouseLeave={handleLeave}
				onKeyDown={handleKeyPress}
				onTouchEnd={handleTouchDown}
				tabIndex={-1}
			>
				<div
					className={`absolute top-0 left-0 w-full h-full bg-black/40 flex flex-col items-center justify-center p-5 player ${state === State.HOVER ? "playerOpen" : ""}`}
				>
					<div className="flex-1 w-full" />
					<div
						className={`w-full flex gap-10 items-center justify-center ${isStream ? "hidden" : ""}`}
					>
						<button type="button" onClick={() => handleSkip("Backward")}>
							<StepBack
								size={36}
								data-type="button"
								className="pointer-events-none"
							/>
						</button>
						<button type="button" onClick={handlePlay}>
							{isPlaying ? (
								<Pause
									size={36}
									data-type="button"
									className="pointer-events-none"
								/>
							) : (
								<Play
									size={36}
									data-type="button"
									className="pointer-events-none"
								/>
							)}
						</button>
						<button type="button" onClick={() => handleSkip("Forward")}>
							<StepForward
								size={36}
								data-type="button"
								className="pointer-events-none"
							/>
						</button>
					</div>
					<div
						className={`w-full flex flex-col items-center justify-end gap-1 ${isStream ? "" : "flex-1"}`}
					>
						<div className="w-full flex items-center gap-2">
							<div className="text-sm">
								{toMinutes(currentTime)} / {toMinutes(duration)}
							</div>
							<div className="flex-1"></div>
							<div className="flex items-center gap-2 group/volume pr-[1px]">
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
										value={ref.current?.volume ?? 0}
										onChange={(event: ChangeEvent<HTMLInputElement>) => {
											if (!ref.current) return;
											ref.current.volume = Number.parseFloat(
												event.target.value,
											);

											if (ref.current.muted) {
												ref.current.muted = false;
												setIsMuted(false);
											}

											localStorage.setItem("volume", event.target.value);
										}}
									/>
								</div>
							</div>
							<button type="button" onClick={() => handleFullScreen()}>
								{document.fullscreenElement ? (
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
						{/** biome-ignore lint/a11y/noStaticElementInteractions: <Ignore this> */}
						<div
							className={`w-full pt-2.5 group/bar cursor-pointer  ${isStream ? "hidden" : ""}`}
							onMouseDown={handleMouseDown}
							onMouseUp={handleMouseUp}
							onMouseMove={handleMouseMove}
							onTouchStart={(event: TouchEvent<HTMLDivElement>) => {
								event.stopPropagation();
								handleMouseDown(event);
							}}
							onTouchEnd={(event: TouchEvent<HTMLDivElement>) => {
								event.stopPropagation();
								event.preventDefault();
								handleMouseUp();
							}}
							onTouchMove={(event: TouchEvent<HTMLDivElement>) => {
								handleMouseMove(event);
							}}
							ref={barRef}
						>
							<div className="w-full rounded-full bg-white/10">
								<div
									className="relative w-min py-0.5 bg-red rounded-full"
									style={{
										width: `${Math.min((currentTime / duration) * 100, 100)}%`,
									}}
								>
									<div className="absolute right-0 top-0 bottom-0 my-auto bg-red rounded-full p-1 group-hover/bar:scale-[200%] transition-all" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
