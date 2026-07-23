import { RiCircleFill } from "@remixicon/react";
import axios from "axios";
import { Clock3Icon, Loader2, Users } from "lucide-react";
import { DateTime } from "luxon";
import { useQueryState } from "nuqs";
import { useRef, useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Dialog, DialogOverlay, DialogTrigger } from "~/components/ui/dialog";
import { Toggle } from "~/components/ui/toggle";
import { cn } from "~/lib/utils";
import {
    type LiveArchiveDto,
    type LiveEventDto,
    useGetChannels,
} from "~/services/live.services";
import Chat from "../components/Chat";
import Viewers from "../components/Viewers";
import useArtPlayer from "../hooks/useArtPlayer";
import useBearer from "../hooks/useBearer";
import useContentID from "../hooks/useContentID";
import type { Viewer } from "../types";
import type { Route } from "./+types/player";

export async function loader({ params }: Route.LoaderArgs) {
	try {
		const { data: eventData } = await axios.get<LiveEventDto>(
			`${import.meta.env.VITE_BACKEND_API}/live/events/${params.slug}`,
		);
		const { data: archiveData } = await axios.get<LiveArchiveDto>(
			`${import.meta.env.VITE_BACKEND_API}/live/events/${params.slug}/archives/${params.broadcast_id}`,
		);

		return {
			title:
				`${eventData.name} | ${archiveData.broadcast_name}` ||
				"<to be announced>",
			url: eventData.thumbnail || "https://cdn.tryz.id.vn/Live%20Image.png",
			eventData,
			archiveData,
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

export default function Page({ loaderData }: Route.ComponentProps) {
	const pageRef = useRef<HTMLDivElement>(null);
	const playerRef = useRef<HTMLDivElement>(null);

	const {
		data: channels,
		isLoading,
		error,
	} = useGetChannels(loaderData.eventData?.slug, loaderData.archiveData?.id);
	const [channel, setChannel] = useQueryState("channel");

	const selectedChannel = channels?.[+(channel ?? 0)] ?? null;
	const [viewers, setViewers] = useState<Viewer[]>([]);

	const bearer = useBearer();
	const url = useContentID(selectedChannel, bearer);

	const isLive = Boolean(!selectedChannel?.archive);

	const { isFullscreen, hideChat } = useArtPlayer({
		serverURL: `${import.meta.env.VITE_BACKEND_API}/live/events/${loaderData.eventData?.slug}/archives/${loaderData.archiveData?.id}/channels/${selectedChannel?.id}/drm`,
		player: playerRef.current,
		page: pageRef.current,
		url,
		type: selectedChannel?.stream_type ?? "hls",
		isLive,
	});

	return (
		<div
			className={`w-full h-full flex-1 flex md:gap-2.5 flex-col md:flex-row overflow-hidden${isFullscreen ? " md:!gap-0" : ""}`}
			ref={pageRef}
		>
			{selectedChannel && (
				<Dialog>
					<DialogOverlay className="z-99" />
					<div className="w-full md:h-full flex flex-col">
						<div
							className="artplayer-app w-full flex-1 aspect-video md:aspect-auto md:rounded-xl overflow-hidden bg-card"
							ref={playerRef}
						></div>
						<div
							className={cn(
								"flex flex-col p-5 gap-1",
								(hideChat || (selectedChannel?.archive && isFullscreen)) &&
									"hidden",
							)}
						>
							<div className="flex-1 line-clamp-2 font-bold">
								{loaderData.title}
							</div>
							{isLive && (
								<div className="flex items-center gap-5">
									<DialogTrigger asChild>
										<button
											type="button"
											className="flex gap-2.5 items-center group/badge underline-offset-2"
										>
											<Badge className="font-bold bg-destructive text-white no-underline!">
												<RiCircleFill /> LIVE
											</Badge>
											<Users className="pointer-events-none" size={14} />
											<span className="pointer-events-none text-xs group-hover/badge:underline">
												{viewers.length} viewer{viewers.length > 1 ? "s" : ""}{" "}
												watching
											</span>
										</button>
									</DialogTrigger>
								</div>
							)}
							{!isLive && (
								<div className="w-full flex gap-2.5 items-center">
									<Badge className="font-bold">Archive</Badge>
									<Clock3Icon className="pointer-events-none" size={14} />
									<span className="pointer-events-none text-xs">
										{loaderData.archiveData?.broadcast_date &&
											DateTime.fromISO(
												loaderData.archiveData?.broadcast_date,
											)?.toFormat("LLL dd yyyy")}
									</span>
								</div>
							)}
							<div className="flex gap-2 mt-2 md:justify-start justify-center">
								{channels?.map((data, idx) => (
									<Toggle
										className="px-5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground group/toggle md:flex-initial flex-1"
										variant={"outline"}
										key={data.id}
										pressed={+(channel ?? 0) === idx}
										onPressedChange={(value) => {
											const v = value ? `${idx}` : null;
											setChannel(v);
										}}
									>
										{data.channel_name}
									</Toggle>
								))}
							</div>
						</div>
					</div>
					{isLive && (
						<div
							id="chatContainer"
							className={`lg:w-[400px] md:w-[300px] w-full flex flex-col overflow-hidden md:flex-none flex-1 ${hideChat ? "hidden" : ""}`}
						>
							<Chat
								isFullscreen={isFullscreen}
								setViewers={setViewers}
								isLive={isLive}
								forceId={`${loaderData.eventData?.slug}_${loaderData.archiveData?.broadcast_slug}`}
							/>
						</div>
					)}
					{isLive && <Viewers viewers={viewers} />}
				</Dialog>
			)}
			{isLoading && (
				<div className="w-full h-full flex items-center justify-center">
					<Loader2 className="animate-spin text-4xl" />
				</div>
			)}
			{error && (
				<div className="w-full h-full flex items-center justify-center">
					An error has occurred.
				</div>
			)}
		</div>
	);
}
