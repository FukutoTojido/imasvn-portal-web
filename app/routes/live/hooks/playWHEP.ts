import MediaMTXWebRTCReader from "~/lib/reader";

export default function playWHEP(player: HTMLVideoElement, url: string) {
	if (!player || !url) return;

	const r = new MediaMTXWebRTCReader({
		url,
		onError: (err) => {
			console.error(err);
		},
		onTrack: (evt) => {
			if (!player) return;
			player.srcObject = evt.streams[0];
		},
	});

	return r;
}
