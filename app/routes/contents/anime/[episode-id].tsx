import { Link, useNavigate } from "react-router";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import VideoPlayer from "./components/VideoPlayer";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/[episode-id]";
import ErrorComponent from "~/routes/components/Error";
import { ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import type { AnimeDto } from "~/routes/admin/contents/anime/[anime-id]";

export const clientLoader = async ({ params }: Route.LoaderArgs) => {
	try {
		const { data: anime } = await axios.get<AnimeDto>(
			`${import.meta.env.VITE_BACKEND_API}/anime/${params.id}`,
			{ withCredentials: true },
		);
		return {
			...anime,
			episodeId: params.episode,
		};
	} catch (e) {
		console.error(e);
		return null;
	}
};

export default function Page({ loaderData }: Route.ComponentProps) {
	const navigate = useNavigate();

	if (!loaderData) return <ErrorComponent />;

	const { id, episodeId, title, episodes } = loaderData;

	const currIndex =
		episodes?.findIndex((episode) => episode.id === +episodeId) ?? -1;
	const previousEpisode = episodes?.[currIndex - 1]?.id;
	const nextEpisode = episodes?.[currIndex + 1]?.id;

	return (
		<div className="w-[960px] max-w-full mx-auto p-5 flex flex-col gap-5">
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem className="text-subtext-0">
						<BreadcrumbLink asChild className="hover:text-text">
							<Link to="/anime">Anime</Link>
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator className="text-subtext-0" />
					<BreadcrumbItem className="text-subtext-0">
						<BreadcrumbLink asChild className="hover:text-text">
							<Link to={`/anime/${id}`}>{title}</Link>
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator className="text-subtext-0" />
					<BreadcrumbItem className="text-text font-semibold">
						Episode {episodes?.[0]?.index} - {episodes?.[0]?.title}
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<div className="w-full aspect-video rounded-md overflow-hidden">
				<VideoPlayer animeId={id} episodeId={+episodeId}/>
			</div>
			<div className="w-full flex flex-col items-center gap-2.5">
				<div className="flex gap-2.5">
					<Button
						className="w-[100px] bg-mantle border border-surface-1 text-text hover:bg-surface-0 p-5"
						onClick={() => navigate(`/anime/${id}/episode/${previousEpisode}`)}
						disabled={previousEpisode === undefined}
					>
						<ChevronLeft />
						Prev
					</Button>
					<Button
						className="w-[100px] bg-text border border-surface-1 text-mantle hover:bg-subtext-0 p-5"
						onClick={() => navigate(`/anime/${id}/episode/${nextEpisode}`)}
						disabled={nextEpisode === undefined}
					>
						Next
						<ChevronRight />
					</Button>
				</div>
				<div className="w-[400px] max-w-full p-2.5 bg-base rounded-md border border-surface-1 gap-1 grid grid-cols-6">
					{episodes?.map(({ index, id: _id }) => (
						<Button
							key={_id}
							asChild
							className={cn(
								"bg-surface-0 border-surface-1 text-text border hover:bg-surface-1",
								+episodeId === _id && "bg-text text-mantle hover:bg-subtext-0",
							)}
						>
							<Link to={`/anime/${id}/episode/${_id}`}>{index}</Link>
						</Button>
					))}
				</div>
			</div>
		</div>
	);
}
