import axios from "axios";
import { Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogTrigger } from "~/components/ui/dialog";
import { cn } from "~/lib/utils";
import type { ProxyData } from "../admin/live/components/UpdateProxy";
import type { Route } from "./+types/page";
import Chat from "./components/Chat";
import Viewers from "./components/Viewers";
import useArtPlayer from "./hooks/useArtPlayer";
import useBearer from "./hooks/useBearer";
import useURL from "./hooks/useURL";
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

export default function Page({ loaderData, params }: Route.ComponentProps) {
	const pageRef = useRef<HTMLDivElement>(null);
	const playerRef = useRef<HTMLDivElement>(null);
	const [contentID, setContentID] = useState<string | null>(null);
	const [type, setType] = useState<"hls" | "dash" | null>(null);

	const [viewers, setViewers] = useState<Viewer[]>([]);

	useEffect(() => {
		const controller = new AbortController();
		try {
			const getLink = async () => {
				const { data } = await axios.get<{
					m3u8: string;
					stream_type: "hls" | "dash";
				}>(
					`${import.meta.env.VITE_BACKEND_API}/hls/proxies/${params.id ?? "root"}`,
					{
						withCredentials: true,
						signal: controller.signal,
					},
				);

				setContentID(data.m3u8);
				setType(data.stream_type);
			};

			getLink();
		} catch (e) {
			console.error(e);
		}

		return () => {
			controller.abort();
		};
	}, [params.id]);

	const bearer = useBearer();

	// NOTE FOR ME IN THE FUTURE: I'M TOO LAZY TO CHANGE THE SCHEMA SO IN THIS CASE, THE URL IS THE CONTENT ID
	const url = useURL(contentID, bearer);

	const { isFullscreen, hideChat } = useArtPlayer({
		id: params.id ?? "root",
		player: playerRef.current,
		page: pageRef.current,
		url: type === "dash" ? url : contentID,
		type,
	});

	return (
		<div
			className={`w-full h-full flex-1 flex md:gap-2.5 flex-col md:flex-row overflow-hidden${isFullscreen ? " md:!gap-0" : ""}`}
			ref={pageRef}
		>
			<Dialog>
				<div className="w-full md:h-full flex flex-col">
					<div
						className="artplayer-app w-full flex-1 aspect-video md:aspect-auto md:rounded-xl overflow-hidden"
						ref={playerRef}
					></div>
					<div className={cn("flex flex-col p-5", hideChat && "hidden")}>
						<div className="flex-1 line-clamp-1 font-bold">
							{loaderData.title}
						</div>
						<div className="flex items-center gap-5">
							<DialogTrigger asChild>
								<button
									type="button"
									className="w-full flex gap-2.5 items-center hover:underline underline-offset-2"
								>
									<Users className="pointer-events-none" size={14} />
									<span className="pointer-events-none text-xs">
										{viewers.length} viewer{viewers.length > 1 ? "s" : ""}{" "}
										watching
									</span>
								</button>
							</DialogTrigger>
						</div>
					</div>
				</div>
				<div
					id="chatContainer"
					className={`lg:w-[400px] md:w-[300px] w-full flex flex-col overflow-hidden md:flex-none flex-1 ${hideChat ? "hidden" : ""}`}
				>
					<Chat isFullscreen={isFullscreen} setViewers={setViewers} />
				</div>
				<Viewers viewers={viewers} container={pageRef.current as HTMLElement} />
			</Dialog>
		</div>
	);
}
