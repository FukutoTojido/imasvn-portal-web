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
						<Button className="text-text bg-transparent hover:bg-text hover:text-base">
							<Trash />
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent className="bg-base border-surface-1 text-text">
						<AlertDialogHeader>
							<AlertDialogTitle>Deleting Anime?</AlertDialogTitle>
							<AlertDialogDescription className="text-subtext-0">
								This action cannot be undone and will permanently delete this
								anime entry from the server.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel className="dark:bg-text dark:text-mantle hover:dark:bg-subtext-0">
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction
								className="bg-crust text-text hover:bg-surface-0"
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
			<div className="w-full p-2.5 border border-surface-1 rounded-xl bg-base flex flex-col gap-2.5">
				<div className="flex items-center justify-end space-x-2">
					<Input
						className="flex-1 !bg-mantle border border-overlay-0 text-text h-full"
						placeholder="Search producer..."
						value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
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
						className="bg-text text-crust hover:bg-base hover:text-text self-end font-normal"
					>
						{loading && <LoaderCircle className="animate-spin" />} New Anime
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
			</div>
		</>
	);
}
