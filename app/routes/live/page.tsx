import axios from "axios";
import { type RefObject, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Dialog } from "~/components/ui/dialog";
import type store from "~/store";
import type { ProxyData } from "../admin/live/components/UpdateProxy";
import type { Route } from "./+types/page";
import Chat from "./components/Chat";
import VideoPlayer from "./components/VideoPlayer";
import Viewers from "./components/Viewers";
import type { Viewer } from "./types";

export async function loader({ params }: Route.LoaderArgs) {
	try {
		const res = await axios.get(
			`${import.meta.env.VITE_BACKEND_API}/hls/proxies/${params.id ?? "root"}/preview`,
		);
		const { name, thumbnail }: Omit<ProxyData, "id" | "m3u8"> = res.data;
		return {
			title: name || "<to be announced>",
			url: thumbnail || "https://cdn.tryz.id.vn/Live%20Image.png",
		};
	} catch (e) {
		console.error(e);
		return {
			title: "Not found",
			url: "",
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

export default function Page({ params, loaderData }: Route.ComponentProps) {
	const userData = useSelector(
		(state: ReturnType<typeof store.getState>) => state.auth.user,
	);
	const pageRef = useRef<HTMLDivElement>(null);
	const [viewers, setViewers] = useState<Viewer[]>([]);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [hideChat, setHideChat] = useState(false);

	const [m3u8, setM3u8] = useState<string | undefined>(undefined);

	useEffect(() => {
		const controller = new AbortController();
		try {
			const getLink = async () => {
				const { data } = await axios.get<ProxyData>(
					`${import.meta.env.VITE_BACKEND_API}/hls/proxies/${params.id ?? "root"}`,
					{ withCredentials: true, signal: controller.signal },
				);

				setM3u8(data.m3u8);
			};

			getLink();
		} catch (e) {
			console.error(e);
		}

		return () => {
			controller.abort();
		};
	}, [params.id]);

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
					isHls
					url={m3u8}
					id={params.id === "root" ? "" : params.id}
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
