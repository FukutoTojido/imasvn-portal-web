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
import AddProducer from "../components/AddProducer";
import TableComponent from "../components/Table";
import type { Producer } from "../types";

const columns: ColumnDef<Producer>[] = [
	{
		accessorKey: "id",
		header: "Producer ID",
	},
	{
		accessorKey: "name",
		header: "Producer Name",
	},
	{
		id: "actions",
		header: "Actions",
		cell: (props) => {
			return (
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button variant={"ghost"}>
							<Trash />
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Deleting Producer?</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone and will permanently delete this
								producer entry from the server.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								onClick={async () => {
									try {
										await axios.delete(
											`${import.meta.env.VITE_BACKEND_API}/producer-id/${props.row.original.id}`,
											{ withCredentials: true },
										);
										toast("Producer deleted");
										mutate("producers");
									} catch (e) {
										console.error(e);
										toast.error("Cannot remove producer");
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

export const getProducers = async () => {
	try {
		const { data } = await axios.get<Producer[]>(
			`${import.meta.env.VITE_BACKEND_API}/producer-id`,
			{ withCredentials: true },
		);
		return data;
	} catch (e) {
		console.error(e);
		return [];
	}
};

export default function Page() {
	const { data, mutate } = useSWR("producers", getProducers);
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
		},
		state: {
			columnFilters,
		},
	});

	useEffect(() => {
		if (!filter) return;
		setPage(0);
	}, [filter, setPage]);

	const navigate = useNavigate();

	return (
		<>
			<div className="text-5xl font-bold">Producer ID Manager</div>
			<Card>
				<CardContent className="space-y-2">
					<div className="flex items-center justify-end space-x-2">
						<Input
							className="flex-1 h-10"
							placeholder="Search producer..."
							value={
								(table.getColumn("name")?.getFilterValue() as string) ?? ""
							}
							onChange={(event) => {
								table.getColumn("name")?.setFilterValue(event.target.value);
								setFilter(event.target.value ? event.target.value : null);
							}}
						/>
						<AddProducer mutate={mutate} />
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
							navigate(`/admin/producers/${row.getValue("id")}`)
						}
					/>
				</CardContent>
			</Card>
		</>
	);
}
