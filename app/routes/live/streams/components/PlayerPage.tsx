import { RiCircleFill } from "@remixicon/react";
import {
	createPlayer,
	liveVideoFeatures,
	qualityFeature,
	streamTypeFeature,
} from "@videojs/react";
import {
	type ShakaAdapter,
	ShakaVideo,
} from "@videojs/react/media/shaka-video";
import { shaka } from "@videojs/shaka-video";
import { Clock3Icon, Loader2, Users } from "lucide-react";
import { DateTime } from "luxon";
import { useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { LiveVideoSkin } from "~/components/imas-videojs/live-video/skin";
import { ChatButton } from "~/components/imas-videojs/ui/chat-button";
import { FullscreenButton } from "~/components/imas-videojs/ui/fullscreen-button";
import { VideoSkin } from "~/components/imas-videojs/video/skin";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import { Dialog, DialogOverlay, DialogTrigger } from "~/components/ui/dialog";
import { Toggle } from "~/components/ui/toggle";
import { cn } from "~/lib/utils";
import {
	type LiveArchiveDto,
	type LiveEventDto,
	useGetChannels,
} from "~/services/live.services";
import Chat from "../../components/Chat";
import Viewers from "../../components/Viewers";
import useBearer from "../../hooks/useBearer";
import useContentID from "../../hooks/useContentID";
import type { Viewer } from "../../types";

const { Player } = createPlayer({
	features: [...liveVideoFeatures, qualityFeature, streamTypeFeature].filter(
		(feature) => feature.name !== "fullscreen",
	),
});

export default function PlayerPage({
	loaderData,
}: {
	loaderData: { eventData?: LiveEventDto; archiveData?: LiveArchiveDto };
}) {
	const pageRef = useRef<HTMLDivElement>(null);
	const shakaRef = useRef<ShakaAdapter>(null);

	const {
		data: channels,
		isLoading,
		error,
	} = useGetChannels(loaderData.eventData?.slug, loaderData.archiveData?.id);
	const [channel, setChannel] = useQueryState("channel");

	const selectedChannel = channels?.[+(channel ?? 0)] ?? null;
	const [viewers, setViewers] = useState<Viewer[]>([]);

	const bearer = useBearer();
	const url = useContentID(
		selectedChannel,
		loaderData.archiveData ?? null,
		bearer,
	);

	const isLive = Boolean(!loaderData.archiveData?.archive);
	const DRMServer = `${import.meta.env.VITE_BACKEND_API}/live/events/${loaderData.eventData?.slug}/archives/${loaderData.archiveData?.id}/channels/${selectedChannel?.id}/drm`;

	const [hideChat, setIsHideChat] = useState(false);
	const [isFullscreen, setFullscreen] = useState(false);

	useEffect(() => {
		if (!url) return;

		shakaRef.current?.engine
			?.getNetworkingEngine()
			?.registerRequestFilter((type, request) => {
				if (type === shaka.net.NetworkingEngine.RequestType.LICENSE) {
					request.allowCrossSiteCredentials = true;
					request.headers = {
						"Content-Type": "application/octet-stream",
					};
				}
			});
	}, [url]);

	const Skin = isLive ? LiveVideoSkin : VideoSkin;

	return (
		<div
			className={`w-full h-full max-h-full flex-1 flex md:gap-2.5 flex-col md:flex-row${isFullscreen ? " md:!gap-0" : ""}`}
			ref={pageRef}
		>
			{selectedChannel && (
				<Dialog>
					<div className="w-full md:h-full flex flex-col">
						<div className="w-full flex-1 overflow-hidden">
							<Player>
								<Skin
									controls={
										<>
											{isLive && (
												<ChatButton state={hideChat} setState={setIsHideChat} />
											)}
											<FullscreenButton
												state={isFullscreen}
												setState={setFullscreen}
												onClick={(isFullscreen) => {
													if (!isFullscreen) {
														document.exitFullscreen();
														screen.orientation.unlock();
														return;
													}

													pageRef.current?.requestFullscreen();
													// biome-ignore lint/suspicious/noExplicitAny: I can't
													(screen.orientation as any).lock("landscape");
												}}
											/>
										</>
									}
								>
									{url && (
										<ShakaVideo
											source={{
												src: url ?? "",
												drm: {
													"com.widevine.alpha": {
														licenseUrl: DRMServer,
													},
												},
											}}
											streamType={isLive ? "live" : "on-demand"}
											mediaRef={shakaRef}
											autoPlay
											muted
										/>
									)}
								</Skin>
							</Player>
						</div>
						<div
							className={cn(
								"flex md:items-center flex-col md:flex-row md:gap-4 p-5",
								(hideChat || (!isLive && isFullscreen)) && "hidden",
							)}
						>
							<div className={cn("flex flex-col gap-1 md:flex-1")}>
								<div className="flex-1 line-clamp-2 font-bold">
									{`${loaderData.eventData?.name} | ${loaderData.archiveData?.broadcast_name}`}
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
													{viewers.length} viewer
													{viewers.length > 1 ? "s" : ""} watching
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
							</div>
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
						<Card
							id="chatContainer"
							className={`${isFullscreen ? "md:rounded-none!" : ""} max-md:rounded-none lg:w-[400px] md:w-[300px] p-0 w-full flex flex-col overflow-hidden md:flex-none flex-1 ${hideChat ? "hidden" : ""}`}
						>
							<Chat
								isFullscreen={isFullscreen}
								setViewers={setViewers}
								isLive={isLive}
								forceId={`${loaderData.eventData?.slug}_${loaderData.archiveData?.broadcast_slug}`}
								pageRef={pageRef.current ?? undefined}
							/>
						</Card>
					)}
					{isLive && (
						<>
							<DialogOverlay className="z-99" />
							<Viewers viewers={viewers} container={pageRef.current} />
						</>
					)}
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
