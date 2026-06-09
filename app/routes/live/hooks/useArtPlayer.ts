import Artplayer from "artplayer";
import artplayerPluginDashControl from "artplayer-plugin-dash-control";
import { useEffect, useRef, useState } from "react";
import type MediaMTXWebRTCReader from "~/lib/reader";
import playWHEP from "./playWHEP";
import useDASH from "./useDASH";
import useHLS from "./useHLS";

const typeMap = {
	hls: "m3u8",
	dash: "mpd",
	whep: "whep",
};

export default function useArtPlayer({
	id,
	page,
	player,
	url,
	type,
	isLive = false,
}: {
	id?: string;
	page?: HTMLDivElement | null;
	player?: HTMLDivElement | null;
	url: string | null;
	type: "hls" | "dash" | "whep" | null;
	isLive?: boolean;
}) {
	const artPlayer = useRef<Artplayer>(null);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [hideChat, setHideChat] = useState(false);
	const rtc = useRef<MediaMTXWebRTCReader | null>(null);

	const playMpd = useDASH(id);
	const playM3U8 = useHLS(id);

	useEffect(() => {
		if (!player || !url || !type) return;

		const art = new Artplayer({
			container: player,
			url: url,
			type: typeMap[type],
			pip: true,
			isLive,
			useSSR: false,
			customType: {
				mpd: playMpd,
				m3u8: playM3U8 as (
					video: HTMLVideoElement,
					url: string,
					art: Artplayer,
				) => unknown,
				whep: (player, url) => {
					const r = playWHEP(player, url) ?? null;
					rtc.current?.close();
					rtc.current = r;
				},
			},
			theme: "#b4befe",
			controls: [
				{
					name: "chat",
					tooltip: "Show/Hide Chat and Title",
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

						page?.requestFullscreen();
						setIsFullscreen(true);
						// biome-ignore lint/suspicious/noExplicitAny: I cant
						(screen.orientation as any).lock("landscape");
					},
				},
			],
			plugins: [
				...(type === "dash"
					? [
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
						]
					: []),
			],
		});

		artPlayer.current = art;

		return () => {
			art.destroy();
			rtc.current?.close();
		};
	}, [url, playMpd, playM3U8, player, page, type, isLive]);

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

	return {
		isFullscreen,
		hideChat,
	};
}
