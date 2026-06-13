import Artplayer from "artplayer";
import Hls, { type HlsConfig } from "hls.js";
import { useCallback } from "react";

declare class ArtHlsPlayer extends Artplayer {
	hls?: Hls;
}

export default function useHLS(id?: string) {
	const playM3u8 = useCallback(
		(video: HTMLVideoElement, url: string, art: ArtHlsPlayer) => {
			if (Hls.isSupported()) {
				if (art.hls) art.hls.destroy();

				const config: Partial<HlsConfig> = {
					debug: true,
					enableWorker: true,
					requireKeySystemAccessOnStart: true,
					emeEnabled: true,
					widevineLicenseUrl: `${import.meta.env.VITE_BACKEND_API}/hls/drm/${id}`,
					drmSystems: {
						"com.widevine.alpha": {
							licenseUrl: `${import.meta.env.VITE_BACKEND_API}/hls/drm/${id}`,
						},
					},
				};

				const hls = new Hls(config);
				hls.loadSource(url);
				hls.attachMedia(video);
				art.hls = hls;
				art.on("destroy", () => hls.destroy());
			} else if (video.canPlayType("application/vnd.apple.mpegurl")) {
				video.src = url;
			} else {
				art.notice.show = "Unsupported playback format: m3u8";
			}
		},
		[id],
	);

	return playM3u8;
}
