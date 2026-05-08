import Artplayer from "artplayer";
import axios from "axios";
import type { MediaPlayerClass, ProtectionDataSet } from "dashjs";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Route } from "./+types/page";
import Chat from "./components/Chat";
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

	if (dashjs.supportsMediaSource()) {
		if (art.dash) art.dash.destroy();

		const dash = dashjs.MediaPlayer().create();
		dash.setProtectionData(protData);
		dash.initialize(video, url, art.option.autoplay);

		art.dash = dash;
		art.on("destroy", () => dash.destroy());
	} else {
		art.notice.show = "Unsupported playback format: mpd";
	}
};

export default function Page({ loaderData }: Route.ComponentProps) {
	const pageRef = useRef<HTMLDivElement>(null);
	const playerRef = useRef<HTMLDivElement>(null);
	const [mpd, setMpd] = useState("");
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [hideChat] = useState(false);
	const [_, setViewers] = useState<Viewer[]>([]);

	useEffect(() => {
		const controller = new AbortController();
		try {
			const getLink = async () => {
				const { data } = await axios.get<{ mpd: string }>(
					`${import.meta.env.VITE_BACKEND_API}/hls/mpd`,
					{ withCredentials: true, signal: controller.signal },
				);

				setMpd(data.mpd);
			};

			getLink();
		} catch (e) {
			console.error(e);
		}

		return () => {
			controller.abort();
		};
	}, []);

	useEffect(() => {
		if (!playerRef.current || !mpd) return;

		const art = new Artplayer({
			container: playerRef.current,
			url: mpd,
			type: "mpd",
			pip: true,
			customType: {
				mpd: playMpd,
			},
		});

		return () => {
			art.destroy();
		};
	}, [mpd]);

	return (
		<div
			className={`w-full h-full flex-1 flex md:gap-2.5 flex-col md:flex-row overflow-hidden ${isFullscreen ? "md:!gap-0" : ""}`}
			ref={pageRef}
		>
			<div className="artplayer-app size-full" ref={playerRef}></div>
			<div
				className={`lg:w-[400px] md:w-[300px] w-full flex flex-col overflow-hidden md:flex-none flex-1 ${hideChat ? "hidden" : ""}`}
			>
				<Chat isFullscreen={isFullscreen} setViewers={setViewers} forceId="protected" />
			</div>
		</div>
	);
}
