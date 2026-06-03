import {
	type ColumnDef,
	type ColumnFiltersState,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import { ChevronLeft, ChevronRight, IdCard, Link } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import useSWR from "swr";
import { Button } from "~/components/ui/button";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import TableComponent from "../components/Table";
import type { EventData } from "../components/UpdateEvent";
import type { Card } from "../types";

export const getCards = async () => {
	try {
		const { data: cards } = await axios.get<Card[]>(
			`${import.meta.env.VITE_BACKEND_API}/cards`,
			{ withCredentials: true },
		);
		const { data: events } = await axios.get<EventData[]>(
			`${import.meta.env.VITE_BACKEND_API}/events`,
			{ withCredentials: true },
		);
		return {
			cards,
			events,
		};
	} catch (e) {
		console.error(e);
		return {
			cards: [],
			events: [],
		};
	}
};

export default function Page() {
	const { data } = useSWR("cards", getCards);
	const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(0));
	const [filter, setFilter] = useQueryState("filter");
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
		filter ? [{ id: "event", value: filter }] : [],
	);

	const columns: ColumnDef<Card>[] = useMemo(
		() => [
			{
				accessorKey: "id",
				header: "Card ID",
			},
			{
				accessorKey: "pid",
				header: "Producer ID",
			},
			{
				accessorKey: "name",
				header: "Producer Name",
			},
			{
				accessorKey: "idol",
				header: "Idol"
			},
			{
				accessorKey: "event",
				header: "Event",
				enableColumnFilter: true,
				filterFn: "weakEquals",
				cell: (props) => (
					<div>
						{
							data?.events.find((event) => event.id === props.cell.getValue())
								?.name
						}
					</div>
				),
			},
			{
				id: "actions",
				header: "Actions",
				cell: (props) => (
					<div className="flex gap-5">
						<Button
							className="text-text bg-transparent hover:bg-text hover:text-base"
							onClick={async (e) => {
								e.stopPropagation();
								await navigator.clipboard.writeText(
									props.row.original.id.match(/.{1,4}/g)?.join("-") ?? "",
								);
								toast("ID copied");
							}}
						>
							<IdCard />
						</Button>
						<Button
							className="text-text bg-transparent hover:bg-text hover:text-base"
							onClick={async (e) => {
								e.stopPropagation();
								await navigator.clipboard.writeText(
									`${import.meta.env.VITE_BASE_URL}/producer-id/${props.row.original.id}`,
								);
								toast("URL copied");
							}}
						>
							<Link />
						</Button>
					</div>
				),
			},
		],
		[data?.events],
	);

	const table = useReactTable({
		data: data?.cards ?? [],
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		initialState: {
			pagination: {
				pageIndex: page,
			},
			sorting: [
				{
					id: "name",
					desc: false,
				},
			],
		},
		state: {
			columnFilters,
		},
		defaultColumn: {
			enableColumnFilter: false,
		},
	});

	useEffect(() => {
		if (!filter) return;
		setPage(0);
	}, [filter, setPage]);

	const navigate = useNavigate();

	return (
		<>
			<div className="text-5xl font-medium text-text">Cards List</div>
			<div className="w-full p-2.5 border border-surface-1 rounded-xl bg-base flex flex-col gap-2.5">
				<Select
					onValueChange={(value) => {
						table.getColumn("event")?.setFilterValue(value);
						setFilter(value);
					}}
				>
					<SelectTrigger className="w-full bg-mantle border-surface-1 focus-visible:ring-overlay-0">
						<SelectValue placeholder="Select Event..." />
					</SelectTrigger>
					<SelectContent className="bg-mantle border border-surface-1 text-text">
						<SelectGroup>
							<SelectLabel>Events</SelectLabel>
							{data?.events.map((event) => (
								<SelectItem
									value={`${event.id}`}
									key={event.id}
									className="data-[highlighted]:bg-surface-0 data-[highlighted]:text-text text-wrap"
								>
									{event.name}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
				<div className="w-full flex items-center justify-end gap-2.5">
					<div className="flex-1 px-2.5 text-sm text-subtext-0">
						Page {table.getState().pagination.pageIndex + 1} of{" "}
						{table.getPageCount()}
					</div>
					<Button
						className="bg-text text-mantle hover:bg-subtext-0 disabled:bg-crust disabled:text-text"
						onClick={() => {
							table.previousPage();
							setPage(table.getState().pagination.pageIndex - 1);
						}}
						disabled={!table.getCanPreviousPage()}
					>
						<ChevronLeft />
					</Button>
					<Button
						className="bg-text text-mantle hover:bg-subtext-0 disabled:bg-crust disabled:text-text"
						onClick={() => {
							table.nextPage();
							setPage(table.getState().pagination.pageIndex + 1);
						}}
						disabled={!table.getCanNextPage()}
					>
						<ChevronRight />
					</Button>
				</div>
				<TableComponent
					table={table}
					columns={columns}
					onRowClick={(row) => navigate(`/admin/cards/${row.getValue("id")}`)}
				/>
			</div>
		</>
	);
}
