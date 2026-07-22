import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";
import {
	type ColumnDef,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { DateTime } from "luxon";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import { Link } from "react-router";
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
import { BRANCH_ALIAS } from "~/routes/live/_streams/page";
import { type LiveEventDto, useGetLives } from "~/services/live.services";
import AddEvent from "./components/AddEvent";

export const columns: ColumnDef<LiveEventDto>[] = [
	{
		accessorKey: "slug",
		enableGlobalFilter: true,
	},
	{
		accessorKey: "name",
		enableGlobalFilter: true,
	},
	{
		accessorKey: "thumbnail",
	},
	{
		accessorKey: "date",
	},
	{
		accessorKey: "ip_slug",
		filterFn: ({ original: { ip_slug } }, _, value) => {
			if (value === null) return true;
			const selectedBranch = BRANCH_ALIAS[value];

			if (!selectedBranch) {
				for (const aliases of Object.values(BRANCH_ALIAS)) {
					if (aliases.includes(ip_slug as string)) return false;
				}

				return true;
			}

			return selectedBranch.includes(ip_slug as string);
		},
	},
];

export default function Live() {
	const { data, isLoading, error } = useGetLives();
	const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(0));
	const [search, setSearch] = useQueryState("search");
	const [globalFilter, setGlobalFilter] = useState<string | string[]>(
		search ?? ([] as string[]),
	);

	const table = useReactTable({
		data: data ?? [],
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onGlobalFilterChange: setGlobalFilter,
		state: {
			globalFilter,
			pagination: {
				pageIndex: page,
				pageSize: 12,
			},
		},
		initialState: {
			columnVisibility: {
				id: false,
			},
		},
		defaultColumn: {
			enableGlobalFilter: false,
		},
		globalFilterFn: "includesString",
	});

	return (
		<>
			<div className="text-5xl font-bold">Live Manager</div>
			<Card className="w-full">
				<CardHeader className="flex">
					<div className="flex-1">
						<CardTitle>Welcome to the darkest area of the room</CardTitle>
						<CardDescription>
							If you know what you are doing, you know what you are doing.
						</CardDescription>
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
					<div className="w-full grid grid-cols-4 gap-4">
						{table
							.getRowModel()
							.rows.map(({ original: { slug, name, thumbnail, date } }) => (
								<Link to={`/admin/live/${slug}`} key={slug}>
									<Card className="hover:cursor-pointer hover:bg-secondary h-full">
										<img
											src={thumbnail ?? ""}
											alt=""
											className="w-full aspect-video object-cover"
										/>
										<CardContent className="flex-col items-start">
											<div className="font-bold line-clamp-2">{name}</div>
											<div className="text-sm">
												{date &&
													DateTime.fromISO(date).toFormat("LLL dd, yyyy")}
											</div>
										</CardContent>
									</Card>
								</Link>
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
					<AddEvent className="ml-auto" />
				</CardFooter>
			</Card>
		</>
	);
}
