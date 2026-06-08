import Artplayer from "artplayer";
import artplayerPluginDashControl from "artplayer-plugin-dash-control";
import axios from "axios";
import type { MediaPlayerClass, ProtectionDataSet } from "dashjs";
import { Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogTrigger } from "~/components/ui/dialog";
import type { Route } from "./+types/page";
import Chat from "./components/Chat";
import Viewers from "./components/Viewers";
import useBearer from "./hooks/useBearer";
import useURL from "./hooks/useURL";
import type { Viewer } from "./types";

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

class ArtDashPlayer extends Artplayer {
	dash?: MediaPlayerClass;
}

const playMpd = async (
	video: HTMLVideoElement,
	url: string,
	art: ArtDashPlayer,
) => {
	const dashjs = await import("dashjs");

	const protData: ProtectionDataSet = {
		"com.widevine.alpha": {
			serverURL: `${import.meta.env.VITE_BACKEND_API}/hls/drm`,
			audioRobustness: "SW_SECURE_CRYPTO",
			videoRobustness: "SW_SECURE_CRYPTO",
			httpRequestHeaders: {
				"Content-Type": "application/octet-stream",
			},
			withCredentials: true,
		},
	};

	if (art.dash) art.dash.destroy();

	const dash = dashjs.MediaPlayer().create();
	dash.setProtectionData(protData);
	dash.initialize(video, url, art.option.autoplay);

	art.dash = dash;
	art.on("destroy", () => dash.destroy());
};

export default function Page({ loaderData }: Route.ComponentProps) {
	const pageRef = useRef<HTMLDivElement>(null);
	const playerRef = useRef<HTMLDivElement>(null);
	const [contentID, setContentID] = useState<string | null>(null);

	const artPlayer = useRef<Artplayer>(null);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [hideChat, setHideChat] = useState(false);
	const [viewers, setViewers] = useState<Viewer[]>([]);

	useEffect(() => {
		const controller = new AbortController();
		try {
			const getLink = async () => {
				const { data } = await axios.get<{ mpd: string }>(
					`${import.meta.env.VITE_BACKEND_API}/hls/mpd`,
					{ withCredentials: true, signal: controller.signal },
				);

				setContentID(data.mpd);
			};

			getLink();
		} catch (e) {
			console.error(e);
		}

		return () => {
			controller.abort();
		};
	}, []);

	const bearer = useBearer();

	// NOTE FOR ME IN THE FUTURE: I'M TOO LAZY TO CHANGE THE SCHEMA SO IN THIS CASE, THE URL IS THE CONTENT ID
	const url = useURL(contentID, bearer);

	useEffect(() => {
		if (!playerRef.current || !url) return;

		const art = new Artplayer({
			container: playerRef.current,
			url: url,
			type: "mpd",
			pip: true,
			// isLive: true,
			useSSR: false,
			customType: {
				mpd: playMpd,
			},
			layers: [
				// {
				// 	name: "title",
				// 	html: (titleRef.current as HTMLElement) ?? undefined,
				// },
			],
			theme: "#b4befe",
			controls: [
				{
					name: "chat",
					tooltip: "Show/Hide Chat",
					html: '<i class="ri-chat-off-line text-2xl"></i>',
					style: {
						cursor: "pointer",
					},
					position: "right",
					click: () => {
						const chatContainer =
							document.querySelector<HTMLDivElement>("#chatContainer");
						if (!chatContainer) return;

						setHideChat(() => !chatContainer.classList.contains("hidden"));
					},
				},
				{
					name: "fullscreen",
					index: 99,
					position: "right",
					tooltip: "Fullscreen",
					html: '<i class="ri-fullscreen-line text-2xl"></i>',
					click: () => {
						if (document.fullscreenElement) {
							document.exitFullscreen();
							screen.orientation.unlock();
							setIsFullscreen(false);
							return;
						}

						pageRef.current?.requestFullscreen();
						setIsFullscreen(true);
						// biome-ignore lint/suspicious/noExplicitAny: I cant
						(screen.orientation as any).lock("landscape");
					},
				},
			],
			plugins: [
				artplayerPluginDashControl({
					quality: {
						control: true,
						setting: true,
						getName: (level) =>
							`${(level as Record<string, string | number>).height}P`,
						title: "Quality",
						auto: "Auto",
					},
				}),
			],
		});

		artPlayer.current = art;

		return () => {
			art.destroy();
		};
	}, [url]);

	useEffect(() => {
		if (!artPlayer.current) return;

		artPlayer.current.controls.update({
			name: "fullscreen",
			html: isFullscreen
				? '<i class="ri-fullscreen-exit-line text-2xl"></i>'
				: '<i class="ri-fullscreen-line text-2xl"></i>',
		});
	}, [isFullscreen]);

	useEffect(() => {
		if (!artPlayer.current) return;

		artPlayer.current.controls.update({
			name: "chat",
			html: hideChat
				? '<i class="ri-message-2-line text-2xl"></i>'
				: '<i class="ri-chat-off-line text-2xl"></i>',
		});
	}, [hideChat]);

	return (
		<div
			className={`w-full h-full flex-1 flex md:gap-2.5 flex-col md:flex-row overflow-hidden${isFullscreen ? " md:!gap-0" : ""}`}
			ref={pageRef}
		>
			<Dialog>
				<div className="w-full md:h-full flex flex-col">
					<div className="artplayer-app w-full flex-1 aspect-video md:aspect-auto md:rounded-xl overflow-hidden" ref={playerRef}></div>
					<div className="flex flex-col p-5">
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
					<Chat
						isFullscreen={isFullscreen}
						setViewers={setViewers}
						forceId="protected"
					/>
				</div>
				<Viewers viewers={viewers} container={pageRef.current as HTMLElement} />
			</Dialog>
		</div>
	);
}
