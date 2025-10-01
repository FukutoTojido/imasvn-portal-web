import axios from "axios";
import { Play, Sparkle } from "lucide-react";
import { DateTime } from "luxon";
import { Link } from "react-router";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import ErrorComponent from "~/routes/components/Error";
import { type Anime, EPISODE_STATE } from "~/types";
import type { Route } from "./+types/[anime-id]";
import { cn } from "~/lib/utils";

export const loader = async ({ params }: Route.LoaderArgs) => {
	try {
		const { data: animes } = await axios.get<
			Omit<Anime, "time"> & { time?: string }
		>(`${import.meta.env.VITE_BACKEND_API}/anime/${params.id}`, {
			withCredentials: true,
		});

		return animes;
	} catch (e) {
		console.error(e);
		return null;
	}
};

export const meta = ({ data }: Route.MetaArgs) => {
	const title = `${data?.title ?? "Anime"} | THE iDOLM@STER Vietnam Portal`;
	const desc = data?.sypnosis ?? "";
	const url = data?.bg;

	return [
		{ title },
		{ name: "description", content: desc },
		{ property: "og:title", content: title },
		{
			property: "og:description",
			content: desc,
		},
		{
			property: "og:image",
			content: url,
		},
		{ property: "og:url", content: "https://live.tryz.id.vn" },
		{ name: "twitter:card", content: "summary_large_image" },
		{
			name: "twitter:title",
			content: title,
		},
		{
			name: "twitter:description",
			content: desc,
		},
		{
			name: "twitter:image",
			content: url,
		},
		{ property: "twitter:url", content: "https://live.tryz.id.vn" },
		{ property: "twitter:domain", content: "live.tryz.id.vn" },
	];
};

export default function Page({ loaderData }: Route.ComponentProps) {
	const { title, titleJapanese, bg, time, sypnosis, episodes, id } =
		loaderData ?? {};

	if (!loaderData) return <ErrorComponent />;

	const eps = episodes?.filter(
		(episodes) => episodes.state === EPISODE_STATE.READY,
	);

	return (
		<div className="w-[960px] max-w-full mx-auto flex flex-col gap-5 sm:p-5 text-text">
			<Breadcrumb className="md:pt-0 md:px-0 pt-5 px-5">
				<BreadcrumbList>
					<BreadcrumbItem className="text-subtext-0">
						<BreadcrumbLink asChild className="hover:text-text">
							<Link to="/anime" viewTransition>
								Anime
							</Link>
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator className="text-subtext-0" />
					<BreadcrumbItem className="text-subtext-0 font-semibold">
						{title}
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<div className="w-full rounded-2xl overflow-hidden flex flex-col border border-surrface-1">
				<div className="relative w-full h-[300px]">
					<img
						src={bg}
						alt=""
						className="absolute w-full h-full object-cover object-center"
					/>
					<div className="absolute w-full h-full bg-gradient-to-t from-base to-50% to-transparent"></div>
				</div>
				<div className="relative flex-1 self-stretch bg-base p-5 flex flex-col gap-2.5">
					<div className="flex flex-col w-full items-center text-center">
						<div className="text-2xl font-bold">{title}</div>
						<div className="text-lg">{titleJapanese}</div>
					</div>
					<div className="w-full flex sm:flex-row flex-col items-center gap-2.5 justify-center">
						{eps?.length ? (
							<>
								<Button
									className="w-[200px] bg-mantle border border-surface-1 text-text hover:bg-surface-0 p-5"
									asChild
								>
									<Link
										to={`/anime/${id}/episode/${eps?.[0]?.id}`}
										viewTransition
									>
										<Play />
										Episode {eps?.[0]?.index}
									</Link>
								</Button>
								<Button
									className="w-[200px] bg-text border border-surface-1 text-mantle hover:bg-subtext-0 p-5"
									asChild
								>
									<Link
										to={`/anime/${id}/episode/${eps?.at(-1)?.id}`}
										viewTransition
									>
										<Sparkle />
										Latest Episode
									</Link>
								</Button>
							</>
						) : (
							<Button
								className="w-[200px] bg-mantle border border-surface-1 text-text hover:bg-surface-0 p-5"
								disabled
							>
								Coming Soon
							</Button>
						)}
					</div>
					<div className="w-full flex md:flex-row flex-col gap-2.5 justify-center">
						<div
							className={cn(
								"md:w-[400px] w-full p-5 bg-mantle rounded-md flex flex-col gap-2.5 text-sm border border-surface-1",
								!eps?.length && "md:w-full" 
							)}
						>
							<span>
								<span className="font-bold">Year:</span>{" "}
								{time ? DateTime.fromISO(time).year : "TBD"}
							</span>
							<p>{sypnosis}</p>
						</div>
						{eps?.length ? (
							<div className="flex-1 overflow-auto h-min grid grid-cols-4 gap-2.5">
								{eps.map(({ id: episodeId, index }) => {
									return (
										<Link
											viewTransition
											key={episodeId}
											to={`/anime/${id}/episode/${episodeId}`}
											className="w-full h-[50px] bg-surface-0 hover:bg-surface-1 transition-all rounded-md border-surface-1 border flex justify-center items-center p-5 text-sm font-semibold gap-2.5 line-clamp-1"
										>
											{index}
										</Link>
									);
								})}
							</div>
						) : (
							""
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
