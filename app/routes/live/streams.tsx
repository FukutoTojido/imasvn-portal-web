import axios from "axios";
import { DateTime } from "luxon";
import { useQueryState } from "nuqs";
import { useMemo, useState } from "react";
import { Link, useViewTransitionState } from "react-router";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Toggle } from "~/components/ui/toggle";
import {
	BRANCH_TYPES,
	BranchType,
	type ProxyDataDto,
} from "../admin/live/components/UpdateProxy";
import { debounce } from "../calendar/characters/page";
import type { Route } from "./+types/streams";
import "./Streams.css";
import { RiCircleFill } from "@remixicon/react";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

export const clientLoader = async () => {
	try {
		const { data: proxies } = await axios.get<Omit<ProxyDataDto, "m3u8">[]>(
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

const RoomCard = ({
	id,
	name,
	thumbnail,
	date,
	branch,
	archive,
}: ProxyDataDto) => {
	const url = `/live/${id === "root" ? "" : id}`;
	const vt = useViewTransitionState(url);

	return (
		<Link
			className="relative w-full h-[300px] flex flex-col text-white group bg-cat-base border border-surface-1 rounded-3xl overflow-hidden hover:bg-surface-0 hover:rounded-md transition-all justify-end touch-manipulation"
			to={`/live/${id === "root" ? "" : id}`}
			viewTransition
			style={{
				viewTransitionName: vt ? `live-${id === "root" ? "" : id}` : undefined,
			}}
			prefetch="intent"
		>
			<img
				src={thumbnail}
				alt=""
				className="absolute w-full h-full object-cover object-center group-hover:scale-110 transition-transform"
			/>
			<div className="absolute size-full bg-gradient-to-t from-crust to-transparent"></div>
			{!archive && (
				<div className="mb-auto relative p-4">
					<Badge className="font-bold bg-destructive text-white no-underline! text-xl p-5">
						<RiCircleFill /> LIVE
					</Badge>
				</div>
			)}
			<div className="relative flex gap-5 items-center p-5">
				{branch && BRANCH_ICONS[+branch] ? (
					<img
						alt=""
						src={BRANCH_ICONS[+branch]}
						className={cn(
							"h-20 aspect-square",
							branch === BranchType.DEARLY_STARS && "invert",
							branch === BranchType.DEARLY_STARS && "grayscale-100",
						)}
					/>
				) : (
					""
				)}
				<div
					className="relative flex flex-col"
					style={{
						filter: "drop-shadow(0 2px 10px rgba(0 0 0 / 1))",
					}}
				>
					<div className="text-lg font-bold">{name}</div>
					<div className="text-sm">
						{DateTime.fromISO(date ?? "").toFormat("LLL dd, yyyy")}
					</div>
				</div>
			</div>
		</Link>
	);
};

export const BRANCH_ICONS: Record<number, string> = {
	[BranchType.ALLSTARS]: "/icons/svg/as.svg",
	[BranchType.CINDERELLA_GIRLS]: "/icons/svg/cg.svg",
	[BranchType.MILLION_LIVE]: "/icons/svg/ml.svg",
	[BranchType.SHINY_COLORS]: "/icons/svg/sc.svg",
	[BranchType.SIDE_M]: "/icons/svg/sm.svg",
	[BranchType.GAKUEN]: "/icons/svg/gk.svg",
	[BranchType.DEARLY_STARS]: "/icons/svg/va.svg",
	[BranchType.IMAS]: "/icons/svg/as.svg",
};

export default function Page({ loaderData }: Route.ComponentProps) {
	const [search, setSearch] = useQueryState("search");
	const [showArchive, setShowArchives] = useQueryState("show_archive");
	const [set, setSet] = useState(new Set<number>());
	const setSearchDebounced = debounce((value: string) => setSearch(value), 200);

	const searched = useMemo(
		() =>
			loaderData.filter(({ id, name }) =>
				!search
					? true
					: id?.toLowerCase().includes(search.toLowerCase() ?? "") ||
						name?.toLowerCase().includes(search.toLowerCase() ?? ""),
			),
		[search, loaderData],
	);

	const filtered = useMemo(
		() =>
			searched.filter(
				({ archive, branch }) =>
					(showArchive || (!showArchive && !archive)) &&
					(set.size === 0 || set.has(branch ?? 0)),
			),
		[searched, showArchive, set],
	);

	return (
		<div className="w-full flex flex-col mx-auto p-5 flex-1 gap-5">
			<div className="sticky top-25 z-2 filters">
				<div className="w-full flex flex-col gap-5 items-center">
					<div className="flex gap-5 items-center w-200 max-w-full">
						<Input
							placeholder="Search for live..."
							className="flex-1 h-10"
							defaultValue={search ?? ""}
							onChange={(e) => setSearchDebounced(e.target.value || null)}
						/>
						<Label className="shrink-0">Show Archives</Label>
						<Switch
							checked={Boolean(showArchive)}
							onCheckedChange={(value) =>
								setShowArchives(value ? "true" : null)
							}
						/>
					</div>
					<div className="flex gap-2.5 flex-wrap justify-center">
						{Object.entries(BRANCH_TYPES).map(([id, label]) => (
							<Toggle
								className="rounded-full px-5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground group/toggle"
								variant={"outline"}
								key={id}
								pressed={set.has(+id)}
								onPressedChange={(value) => {
									if (value) {
										if (set.has(+id)) return;
										set.add(+id);
										setSet(new Set(set));
									}

									if (!value) {
										if (!set.has(+id)) return;
										set.delete(+id);
										setSet(new Set(set));
									}
								}}
							>
								{BRANCH_ICONS[+id] && (
									<div
										className={cn(
											"flex items-center justify-center",
											+id === BranchType.DEARLY_STARS &&
												"group-data-[state=off]/toggle:invert",
											+id === BranchType.IMAS &&
												"grayscale-100 brightness-100 group-data-[state=off]/toggle:invert",
										)}
									>
										<img
											alt=""
											src={BRANCH_ICONS[+id]}
											className="h-full min-h-4"
										/>
									</div>
								)}
								<span
									className={cn(
										"hidden md:inline",
										+id === BranchType.OTHERS && "inline",
									)}
								>
									{label}
								</span>
							</Toggle>
						))}
					</div>
				</div>
			</div>
			<div className="w-full grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-5">
				{filtered.map((data) => (
					<RoomCard {...data} key={data.id} />
				))}
			</div>
		</div>
	);
}
