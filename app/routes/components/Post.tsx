import { Ellipsis, MessageCircle, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";
import { UserType, type PostData, type UserState } from "~/types";
import type store from "~/store";
import Button from "./Button";
import UserSkeleton from "./UserSkeleton";
import OpenImage from "./OpenImage";
import PostSkeleton from "./PostSkeleton";
import type { SWRInfiniteKeyedMutator } from "swr/infinite";
import axios from "axios";
import Anchorize from "./Anchorize";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";

const size = {
	4: "20vw",
	3: "40vw",
	2: "60vw",
	1: "80vw",
};

function parseTime(time: string) {
	const currentTimezone = new Date().getTimezoneOffset();
	const currentDate = new Date(time);
	currentDate.setTime(currentDate.getTime() - currentTimezone * 60 * 1000);

	const [date, timestamp] = currentDate
		.toISOString()
		.split(".")
		.at(0)
		?.split("T") as string[];

	const [year, month, day] = date.split("-");

	return `${timestamp.split(":").at(0)}:${timestamp.split(":").at(1)} · ${day}/${month}/${year}`;
}

export default function Post({
	data,
	redirect = true,
	revalidator,
}: {
	data?: PostData;
	redirect?: boolean;
	revalidator?: SWRInfiniteKeyedMutator<PostData[]>;
}) {
	const currentUser = useSelector(
		(state: ReturnType<typeof store.getState>) => state.auth.user,
	);

	const [showMenu, setShowMenu] = useState<boolean>(false);
	const navigate = useNavigate();

	const containerRef = useRef<HTMLDivElement>(null);
	const userRef = useRef<HTMLAnchorElement>(null);
	const imageRef = useRef<HTMLDivElement>(null);
	const popupRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);

	const handleClick = (event: MouseEvent) => {
		if (
			!data ||
			!redirect ||
			event.target === null ||
			userRef.current?.contains(event.target as Node) ||
			imageRef.current?.contains(event.target as Node) ||
			popupRef.current?.contains(event.target as Node) ||
			buttonRef.current?.contains(event.target as Node) ||
			(event.target as HTMLElement).tagName === "BUTTON" ||
			(event.target as HTMLElement).tagName === "A"
		)
			return;

		navigate(`/posts/${data.id}`);
	};

	const handlePopup = (event: MouseEvent) => {
		if (
			popupRef.current?.contains(event.target as Node) ||
			buttonRef.current?.contains(event.target as Node)
		) {
			return;
		}

		setShowMenu(false);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		document.addEventListener("click", handlePopup);

		if (!containerRef.current) return;
		containerRef.current.addEventListener("click", handleClick);

		return () => {
			document.removeEventListener("click", handlePopup);
			containerRef.current?.removeEventListener("click", handleClick);
		};
	}, []);

	const toggleMenu = () => {
		setShowMenu(!showMenu);
	};

	const deletePost = async () => {
		if (!data) return;

		try {
			await axios.delete(
				`${import.meta.env.VITE_BACKEND_API}/posts/${data.id}`,
				{
					withCredentials: true,
				},
			);

			navigate("/");
			revalidator?.();
		} catch (e) {
			console.error(e);
		}
	};

	if (!data) return <PostSkeleton />;

	return (
		<div
			className="w-full p-5 bg-base border border-surface-1 md:rounded-md flex flex-col gap-5"
			style={{
				cursor: redirect ? "pointer" : "initial",
			}}
			ref={containerRef}
		>
			<div
				// href="#"
				className="flex justify-between w-full"
			>
				<Link
					ref={userRef}
					to={`/users/${data.user.id}`}
					className="hover:underline underline-offset-2 flex items-center gap-2.5 text-subtext-1"
				>
					<img
						src={data.user.avatar}
						width={40}
						height={40}
						alt=""
						className="rounded-full"
						style={{
							imageRendering: "auto"
						}}
					/>
					<div className="flex flex-col">
						<div className="font-bold text-subtext-1">{data.user.name}</div>
						<div className="text-sm text-subtext-0">@{data.user.tag}</div>
					</div>
				</Link>
				{currentUser.authType === UserType.OK &&
				currentUser.id === data.user.id ? (
					<Popover>
						<PopoverTrigger asChild>
							<button
								type="button"
								className="text-primary-6 relative p-2 hover:bg-primary-2 rounded-lg"
								onClick={toggleMenu}
								ref={buttonRef}
							>
								<Ellipsis />
							</button>
						</PopoverTrigger>
						<PopoverContent align="end" className="bg-base p-0 w-max min-w-[150px] border border-surface-1 overflow-hidden">
							<button
								type="button"
								className="w-full text-red relative p-4 hover:bg-surface-0 flex items-center gap-4"
								onClick={() => deletePost()}
							>
								<Trash2 size={16} />
								Delete
							</button>
						</PopoverContent>
					</Popover>
				) : (
					""
				)}
			</div>

			{/* <div className="w-full">{<Anchorize input={data.content} />}</div> */}
			<div className="w-full text-text">
				<Anchorize input={data.content} />
			</div>
			<div
				className={`relative w-full gap-1 rounded-xl overflow-hidden ${data.images?.length === 0 ? "hidden" : ""} max-h-[700px] ${data.images?.length === 1 ? "flex" : "h-96 grid grid-cols-2 grid-rows-2"}`}
				ref={imageRef}
			>
				{data.images?.map((image, idx, arr) => {
					return (
						<div
							key={image.url}
							className={`relative bg-mantle ${(arr.length < 4 && idx === 0) || (arr.length < 3) ? "row-span-2" : ""} ${arr.length === 1 ? "flex flex-1" : ""} overflow-hidden`}
						>
							<OpenImage imageSet={data.images ?? []} atIndex={idx}>
								<img
									src={image.url}
									width={arr.length === 1 ? 0 : undefined}
									height={arr.length === 1 ? 0 : undefined}
									className={`object-cover block flex-1 w-full h-full ${arr.length === 1 ? "w-auto h-auto" : ""} object-center`}
									sizes={size[arr.length as 1 | 2 | 3 | 4]}
									alt=""
								/>
							</OpenImage>
						</div>
					);
				})}
			</div>
			<div className="w-full flex items-center justify-between">
				<div className="text-subtext-0 text-sm">
					Posted at {parseTime(data.time)}
				</div>
				<div className="flex gap-2.5 items-center text-subtext-0">
					<MessageCircle />
					{data.commentsCount}
				</div>
			</div>
		</div>
	);
}
