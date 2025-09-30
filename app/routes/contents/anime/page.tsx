import { DateTime } from "luxon";
import { Input } from "~/components/ui/input";
import type { Anime } from "~/types";
import AnimeCard from "./components/AnimeCard";
import type { Route } from "./+types/page";
import axios from "axios";

export const genMockAnime = (id: number) => {
	const Mock: Anime = {
		id,
		title: "THE iDOLM@STER MILLION LIVE!",
		titleJapanese: "アイドルマスター ミリオンライブ！",
		sypnosis:
			"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
		time: DateTime.now(),
		bg: "/riamungu.png",
		episodes: [...Array(10)].map((_, idx) => ({
			id: idx,
			title: "Skibidi Toilet",
			animeId: id,
			index: "1",
		})),
	};
	return Mock;
};

export const clientLoader = async () => {
	try {
		const { data: animes } = await axios.get<
			(Omit<Anime, "time"> & { time?: string })[]
		>(`${import.meta.env.VITE_BACKEND_API}/anime`, {
			withCredentials: true,
		});

		return animes;
	} catch (e) {
		console.error(e);
		return [];
	}
};

export default function Page({ loaderData }: Route.ComponentProps) {
	return (
		<div className="w-[1200px] max-w-full flex flex-col mx-auto p-5 flex-1 gap-5">
			<div className="w-full">
				<Input
					className="text-text placeholder:italic h-[50px]"
					placeholder="Search for anime here..."
				/>
			</div>
			<div className="w-full grid grid-cols-3 gap-5">
				{loaderData.map((data) => (
					<AnimeCard
						{...{
							...data,
							time: data.time ? DateTime.fromISO(data.time) : undefined,
						}}
						key={data.id}
					/>
				))}
			</div>
		</div>
	);
}
