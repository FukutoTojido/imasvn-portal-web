import axios from "axios";
import { Link, useViewTransitionState } from "react-router";
import type { ProxyData } from "../admin/live/components/UpdateProxy";
import type { Route } from "./+types/streams";

export const clientLoader = async () => {
	try {
		const { data: proxies } = await axios.get<Omit<ProxyData, "m3u8">[]>(
			`${import.meta.env.VITE_BACKEND_API}/hls/proxies`,
			{
				withCredentials: true,
			},
		);

		const idx = proxies.findIndex((room) => room.id === "root");
		if (idx === -1) return proxies;

		return [proxies[idx], ...proxies.slice(0, idx), ...proxies.slice(idx + 1)];
	} catch (e) {
		console.error(e);
		return [];
	}
};

const RoomCard = ({ id, name, thumbnail }: ProxyData) => {
	const url = `/live/${id === "root" ? "" : id}`;
	const vt = useViewTransitionState(url);

	return (
		<Link
			className="relative w-full h-[300px] flex flex-col text-white group bg-base border border-surface-1 rounded-3xl overflow-hidden hover:bg-surface-0 hover:rounded-md transition-all justify-end"
			to={`/live/${id === "root" ? "" : id}`}
			viewTransition
			style={{
				viewTransitionName: vt ? `live-${id === "root" ? "" : id}` : undefined,
			}}
		>
			<img
				src={thumbnail}
				alt=""
				className="absolute w-full h-full object-cover object-center group-hover:scale-110 transition-transform"
			/>
			<div className="absolute size-full bg-gradient-to-t from-crust to-transparent"></div>
			<div className="relative flex flex-col p-5">
				<div className="text-lg font-bold">{name}</div>
			</div>
		</Link>
	);
};

export default function Page({ loaderData }: Route.ComponentProps) {
	return (
		<div className="w-[1200px] max-w-full flex flex-col mx-auto p-5 flex-1 gap-5">
			<div className="w-full grid md:grid-cols-2 grid-cols-1 gap-5">
				{loaderData.map((data) => (
					<RoomCard {...data} key={data.id} />
				))}
			</div>
		</div>
	);
}
