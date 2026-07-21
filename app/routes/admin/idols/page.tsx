import {
	type ColumnDef,
	type ColumnFiltersState,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import { ChevronLeft, ChevronRight, Trash } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import type { CharacterData } from "~/routes/calendar/types";
import TableComponent from "../components/Table";

const columns: ColumnDef<CharacterData>[] = [
	{
		accessorKey: "icon",
		header: "",
		cell: (props) => (
			<img
				src={props.cell.getValue() as string}
				alt=""
				className="w-[50px] aspect-square object-top object-cover rounded-md"
			/>
		),
	},
	{
		accessorKey: "name",
		header: "Name",
		cell: (props) => (
			<div className="w-[500px] text-wrap">
				{props.cell.getValue() as string}
			</div>
		),
	},
	{
		id: "actions",
		header: "Actions",
		cell: (props) => {
			return (
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button variant="ghost">
							<Trash />
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Deleting Event?</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone and will permanently delete this
								event entry from the server.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								onClick={async () => {
									try {
										await axios.delete(
											`${import.meta.env.VITE_BACKEND_API}/characters/${props.row.original.id}`,
											{ withCredentials: true },
										);
										toast("Event deleted");
										mutate("characters");
									} catch (e) {
										console.error(e);
										toast.error("Cannot remove character");
									}
								}}
							>
								Continue
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			);
		},
	},
];

export const getCharacters = async () => {
	try {
		const { data } = await axios.get<CharacterData[]>(
			`${import.meta.env.VITE_BACKEND_API}/characters`,
		);
		return data;
	} catch (e) {
		console.error(e);
		return [];
	}
};

export default function Page() {
	const { data } = useSWR("characters", getCharacters);
	const navigate = useNavigate();

	const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(0));
	const [filter, setFilter] = useQueryState("filter");
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
		filter ? [{ id: "name", value: filter }] : [],
	);

	const table = useReactTable({
		data: data ?? [],
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		initialState: {
			pagination: {
				pageIndex: page,
			},
			columnVisibility: {
				id: false,
			},
		},
		state: {
			columnFilters,
			pagination: {
				pageIndex: page,
				pageSize: 10,
			},
		},
	});

	useEffect(() => {
		if (!filter) return;
		setPage(0);
	}, [filter, setPage]);

	return (
		<>
			<div className="text-5xl font-bold">Idols Manager</div>
			<Card className="w-full">
				<CardContent className="space-y-2">
					<div className="flex items-center justify-end space-x-2">
						<Input
							className="flex-1 h-10"
							placeholder="Search events..."
							value={
								(table.getColumn("name")?.getFilterValue() as string) ?? ""
							}
							onChange={(event) => {
								table.getColumn("name")?.setFilterValue(event.target.value);
								setFilter(event.target.value ? event.target.value : null);
							}}
						/>
					</div>
					<div className="w-full flex items-center justify-end gap-2.5">
						<div className="flex-1 px-2.5 text-sm">
							Page {table.getState().pagination.pageIndex + 1} of{" "}
							{table.getPageCount()}
						</div>
						<Button
							onClick={() => {
								table.previousPage();
								setPage(table.getState().pagination.pageIndex - 1);
							}}
							disabled={!table.getCanPreviousPage()}
						>
							<ChevronLeft />
						</Button>
						<Button
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
						onRowClick={(row) =>
							navigate(`/admin/idols/${row.original.id}`, {
								viewTransition: true,
							})
						}
					/>
				</CardContent>
			</Card>
		</>
	);
}
