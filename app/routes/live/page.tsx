import { useSelector } from "react-redux";
import type store from "~/store";
import Chat from "./components/Chat";
import { useRef, useState, type RefObject } from "react";
import type { Viewer } from "./types";
import VideoPlayer from "./components/VideoPlayer";
import Viewers from "./components/Viewers";
import type { Route } from "./+types/page";
import axios from "axios";
import { Dialog, DialogPortal } from "~/components/ui/dialog";

export async function loader() {
	try {
		const res = await axios.get(
			`${import.meta.env.VITE_BACKEND_API}/live/preview`,
		);
		const { title, url }: { title: string; url: string } = res.data;
		return {
			title,
			url,
		};
	} catch (e) {
		console.error(e);
		return {
			title: "Tsukimura Temari Radio 24/7",
			url: "https://cdn.tryz.id.vn/Live%20Image.png",
		};
	}
}

export function meta({ data: { title, url } }: Route.MetaArgs) {
	return [
		{ title },
		{ name: "description", content: "Live | THE iDOLM@STER Vietnam Portal" },
		{ property: "og:title", content: title },
		{
			property: "og:description",
			content: "Live | THE iDOLM@STER Vietnam Portal",
		},
		{
			property: "og:image",
			content: url,
		},
		{ property: "og:url", content: "https://jibunrest.art" },
		{ name: "twitter:card", content: "summary_large_image" },
		{
			name: "twitter:title",
			content: title,
		},
		{
			name: "twitter:description",
			content: "Live | THE iDOLM@STER Vietnam Portal",
		},
		{
			name: "twitter:image",
			content: url,
		},
		{ property: "twitter:url", content: "https://jibunrest.art" },
		{ property: "twitter:domain", content: "jibunrest.art" },
	];
}

export default function Page({ loaderData }: Route.ComponentProps) {
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
			<Dialog>
				<VideoPlayer
					title={loaderData.title}
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
				<Viewers viewers={viewers} container={pageRef.current as HTMLElement} />
			</Dialog>
		</div>
	);
}
