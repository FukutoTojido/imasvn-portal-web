import { Link } from "react-router";
import type { Anime } from "~/types";

export default function AnimeCard({ title, time, bg, id }: Anime) {
	return (
		<Link
			className="relative w-full h-[300px] flex flex-col text-white group bg-base border border-surface-1 rounded-3xl overflow-hidden hover:bg-surface-0 hover:rounded-md transition-all justify-end"
			to={`/anime/${id}`}
			viewTransition
		>
			<img
				src={bg}
				alt=""
				className="absolute w-full h-full object-cover object-center group-hover:scale-110 transition-transform"
			/>
			<div className="absolute size-full bg-gradient-to-t from-crust to-transparent"></div>
			<div className="relative flex flex-col p-5">
				<div className="text-lg font-bold">{title}</div>
				<div className="text-sm">{time?.year ?? "TBD"}</div>
			</div>
		</Link>
	);
}
