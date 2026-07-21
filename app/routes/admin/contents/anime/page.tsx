import {
	type ColumnDef,
	type ColumnFiltersState,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import { ChevronLeft, ChevronRight, LoaderCircle, Trash } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
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
import type { Anime } from "~/types";
import TableComponent from "../../components/Table";

const columns: ColumnDef<Anime>[] = [
	{ accessorKey: "id" },
	{
		accessorKey: "title",
		header: "Title",
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
							<AlertDialogTitle>Deleting Anime?</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone and will permanently delete this
								anime entry from the server.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								onClick={async () => {
									try {
										await axios.delete(
											`${import.meta.env.VITE_BACKEND_API}/anime/${props.row.original.id}`,
											{ withCredentials: true },
										);
										toast("Anime deleted");
										mutate("animes");
									} catch (e) {
										console.error(e);
										toast.error("Cannot remove anime");
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

export const getAnimes = async () => {
	try {
		const { data } = await axios.get<Anime[]>(
			`${import.meta.env.VITE_BACKEND_API}/anime`,
			{ withCredentials: true },
		);
		return data;
	} catch (e) {
		console.error(e);
		return [];
	}
};

export default function Page() {
	const navigate = useNavigate();

	const { data } = useSWR("animes", getAnimes);
	const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(0));
	const [filter, setFilter] = useQueryState("filter");
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
		filter ? [{ id: "name", value: filter }] : [],
	);

	const [loading, setLoading] = useState(false);

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
			columnVisibility: {
				id: false,
			},
		},
	});

	const newAnime = async () => {
		const { data } = await axios.post(
			`${import.meta.env.VITE_BACKEND_API}/anime`,
			undefined,
			{
				withCredentials: true,
			},
		);

		navigate(`/admin/anime/${data}`);
	};

	return (
		<>
			<div className="text-5xl font-bold">Anime Manager</div>
			<Card className="w-full">
				<CardContent className="space-y-2">
					<div className="flex items-center justify-end space-x-2">
						<Input
							className="flex-1 h-10"
							placeholder="Search producer..."
							value={
								(table.getColumn("title")?.getFilterValue() as string) ?? ""
							}
							onChange={(event) => {
								table.getColumn("title")?.setFilterValue(event.target.value);
								setFilter(event.target.value ? event.target.value : null);
							}}
						/>
						<Button
							disabled={loading}
							onClick={async () => {
								setLoading(true);
								await newAnime();
								setLoading(false);
							}}
						>
							{loading && <LoaderCircle className="animate-spin" />} New Anime
						</Button>
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
						onRowClick={(row) => {
							navigate(`/admin/anime/${row.getValue("id")}`, {
								viewTransition: true,
							});
						}}
					/>
				</CardContent>
			</Card>
		</>
	);
}
