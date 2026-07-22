import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";
import {
    type ColumnFiltersState,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Toggle } from "~/components/ui/toggle";
import { useIsMobile } from "~/hooks/use-mobile";
import { cn } from "~/lib/utils";
import { useGetLives } from "~/services/live.services";
import {
    BRANCH_TYPES,
    BranchType,
} from "../../admin/live/components/UpdateProxy";
import { columns } from "../../admin/live/page";
import "../Streams.css";
import Archive from "./components/Archive";

export const BRANCH_ALIAS: Record<number, string[]> = {
	[BranchType.ALLSTARS]: ["765as"],
	[BranchType.CINDERELLA_GIRLS]: ["cinderella"],
	[BranchType.MILLION_LIVE]: ["million"],
	[BranchType.SHINY_COLORS]: ["shinycolors"],
	[BranchType.SIDE_M]: ["sidem", "315passionhour"],
	[BranchType.GAKUEN]: ["gakuen"],
	[BranchType.DEARLY_STARS]: ["valiv"],
	[BranchType.IMAS]: ["idolmaster"],
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

export default function Page() {
	const { data, isLoading, error } = useGetLives();
	const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(0));
	const [search, setSearch] = useQueryState("search");
	const [branch, setBranch] = useQueryState("branch");
	const [globalFilter, setGlobalFilter] = useState<string | string[]>(
		search ?? ([] as string[]),
	);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
		{
			id: "ip_slug",
			value: branch,
		},
	]);
	const isMobile = useIsMobile();

	const table = useReactTable({
		data: data ?? [],
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnFiltersChange: setColumnFilters,
		onGlobalFilterChange: setGlobalFilter,
		state: {
			globalFilter,
			pagination: {
				pageIndex: page,
				pageSize: isMobile ? 5 : 12,
			},
			columnFilters,
		},
		defaultColumn: {
			enableGlobalFilter: false,
		},
		globalFilterFn: "includesString",
	});

	return (
		<div className="p-4 mx-auto max-w-full w-300">
			<Card className="max-w-full">
				<CardHeader className="flex gap-4">
					<div className="flex-1">
						<CardTitle>Welcome to the darkest area of the room</CardTitle>
						<CardDescription>
							If you know what you are doing, you know what you are doing.
						</CardDescription>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<Input
						className="w-full h-10"
						placeholder="Search for live"
						value={search ?? ""}
						onChange={(event) => {
							table.setGlobalFilter(String(event.target.value));
							setSearch(event.target.value ? event.target.value : null);
							setPage(0);
						}}
					/>
					<div className="flex gap-2.5 flex-wrap justify-center">
						{Object.entries(BRANCH_TYPES).map(([id, label]) => (
							<Toggle
								className="rounded-full px-5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground group/toggle"
								variant={"outline"}
								key={id}
								pressed={branch === id}
								onPressedChange={(value) => {
									const v = value ? id : null;
									setBranch(v);
									table.getColumn("ip_slug")?.setFilterValue(v);
									setPage(0);
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
					<div className="w-full grid md:grid-cols-4 grid-cols-1 gap-4">
						{table.getRowModel().rows.map(({ original }) => (
							<Archive data={original} key={original.slug} />
						))}
						{(error || data?.length === 0) && (
							<div className="col-span-full text-center py-20">No result</div>
						)}
						{isLoading && (
							<div className="col-span-full text-center py-20">
								<Loader2 className="animate-spin text-4xl mx-auto" />
							</div>
						)}
					</div>
				</CardContent>
				<CardFooter>
					<div className="flex-1 px-2.5 text-sm">
						Page {table.getState().pagination.pageIndex + 1} of{" "}
						{table.getPageCount()}
					</div>
					<div className="flex gap-1">
						<Button
							onClick={() => {
								table.previousPage();
								setPage(table.getState().pagination.pageIndex - 1);
							}}
							disabled={!table.getCanPreviousPage()}
						>
							<RiArrowLeftSLine />
						</Button>
						<Button
							onClick={() => {
								table.nextPage();
								setPage(table.getState().pagination.pageIndex + 1);
							}}
							disabled={!table.getCanNextPage()}
						>
							<RiArrowRightSLine />
						</Button>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
