import { useRef } from "react";
import useArtPlayer from "~/routes/live/hooks/useArtPlayer";

export type VideoPlayerProps = {
	url: string;
	subtitles: string;
	type?: "hls" | "dash";
};

export default function VideoPlayer({
	url,
	subtitles,
	type = "hls",
}: VideoPlayerProps) {
	const playerRef = useRef<HTMLDivElement>(null);
	const pageRef = useRef<HTMLDivElement>(null);

	useArtPlayer({
		page: pageRef,
		player: playerRef,
		url,
		subtitles,
		type,
	});

	return (
		<div
			className="w-full aspect-video rounded-md overflow-hidden"
			ref={pageRef}
		>
			<div
				className="artplayer-app w-full h-full aspect-video md:aspect-auto md:rounded-xl overflow-hidden"
				ref={playerRef}
			></div>
		</div>
	);
}
