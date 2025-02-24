import { useSelector } from "react-redux";
import type store from "~/store";
import Chat from "./components/Chat";
import { useRef, useState, type RefObject } from "react";
import type { Viewer } from "./types";
import VideoPlayer from "./components/VideoPlayer";
import Viewers from "./components/Viewers";
import "./Live.css";
import type { Route } from "./+types/page";

// biome-ignore lint/correctness/noEmptyPattern: <explanation>
export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Live | THE iDOLM@STER Vietnam Portal" },
		{ name: "description", content: "Tsukimura Temari Radio 24/7" },
		{ property: "og:title", content: "Live | THE iDOLM@STER Vietnam Portal" },
		{ property: "og:description", content: "Tsukimura Temari Radio 24/7" },
		{
			property: "og:image",
			content: "https://cdn.tryz.id.vn/Live%20Image.png",
		},
		{ property: "og:url", content: "https://live.tryz.id.vn" },
		{ name: "twitter:card", content: "summary_large_image" },
		{
			name: "twitter:title",
			content: "Live | THE iDOLM@STER Vietnam Portal",
		},
		{
			name: "twitter:description",
			content: "Tsukimura Temari Radio 24/7",
		},
		{
			name: "twitter:image",
			content: "https://cdn.tryz.id.vn/Live%20Image.png",
		},
		{ property: "twitter:url", content: "https://live.tryz.id.vn" },
		{ property: "twitter:domain", content: "live.tryz.id.vn" },
	];
}

export default function Page() {
	const userData = useSelector(
		(state: ReturnType<typeof store.getState>) => state.auth.user,
	);
	const pageRef = useRef<HTMLDivElement>(null);
	const [viewers, setViewers] = useState<Viewer[]>([]);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [hideChat, setHideChat] = useState(false);

	return (
		<div
			className={`w-full h-full flex-1 flex md:gap-2.5 flex-col md:flex-row overflow-hidden ${isFullscreen ? "md:!gap-0" : ""}`}
			ref={pageRef}
		>
			<VideoPlayer
				userData={userData}
				pageRef={pageRef as RefObject<HTMLDivElement>}
				isFullscreen={isFullscreen}
				setIsFullscreen={setIsFullscreen}
				hideChat={hideChat}
				setHideChat={setHideChat}
				viewers={viewers}
			/>
			<div
				className={`lg:w-[400px] md:w-[300px] w-full flex flex-col overflow-hidden md:flex-none flex-1 ${hideChat ? "hidden" : ""}`}
			>
				<Chat isFullscreen={isFullscreen} setViewers={setViewers} />
			</div>
			<Viewers viewers={viewers} />
		</div>
	);
}
