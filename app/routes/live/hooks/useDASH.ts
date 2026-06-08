import Artplayer from "artplayer";
import type { MediaPlayerClass, ProtectionDataSet } from "dashjs";
import { useCallback } from "react";

class ArtDashPlayer extends Artplayer {
	dash?: MediaPlayerClass;
}

export default function useDASH(id?: string) {
	const fn = useCallback(
		async (video: HTMLVideoElement, url: string, art: ArtDashPlayer) => {
			const dashjs = await import("dashjs");

			const protData: ProtectionDataSet = {
				"com.widevine.alpha": {
					serverURL: `${import.meta.env.VITE_BACKEND_API}/hls/drm/${id}`,
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

			if (id) dash.setProtectionData(protData);
			dash.initialize(video, url, art.option.autoplay);

			art.dash = dash;
			art.on("destroy", () => dash.destroy());
		},
		[id],
	);

	return fn;
}
