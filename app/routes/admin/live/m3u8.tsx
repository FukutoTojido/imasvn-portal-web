import {
	type ColumnDef,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import { ChevronLeft, ChevronRight, Trash } from "lucide-react";
import { DateTime } from "luxon";
import { parseAsInteger, useQueryState } from "nuqs";
import { type Dispatch, type SetStateAction, useRef, useState } from "react";
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
import TableComponent from "../components/Table";
import type { ProxyDataDto } from "./components/UpdateProxy";
import UpdateProxy from "./components/UpdateProxy";

const columns: ColumnDef<ProxyDataDto>[] = [
	{
		accessorKey: "id",
		header: "Room ID",
		enableGlobalFilter: true,
	},
	{
		accessorKey: "thumbnail",
		header: "",
		cell: (props) => (
			<div
				className="h-20 w-30 rounded-md bg-cover bg-center"
				style={{ backgroundImage: `url("${props.row.original.thumbnail}")` }}
			></div>
		),
	},
	{
		accessorKey: "name",
		header: "Room Name",
		enableGlobalFilter: true,
	},
	{
		accessorKey: "date",
		header: "Start Date",
		cell: (props) => (
			<>
				{DateTime.fromISO(props.row.original.date ?? "").toFormat("dd-MM-yyyy")}
			</>
		),
	},
	{
		id: "actions",
		header: "Actions",
		cell: (props) => {
			return (
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button
							variant={"ghost"}
							disabled={props.row.original.id === "root"}
						>
							<Trash />
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Deleting Proxy?</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone and will permanently delete this
								proxy entry from the server.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								onClick={async () => {
									try {
										await axios.delete(
											`${import.meta.env.VITE_BACKEND_API}/hls/proxies/${props.row.original.id}`,
											{ withCredentials: true },
										);
										toast("Proxy deleted");
										mutate("proxies");
									} catch (e) {
										console.error(e);
										toast.error("Cannot remove proxy");
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

const getProxies = async () => {
	try {
		const res = await axios.get(
			`${import.meta.env.VITE_BACKEND_API}/hls/proxies`,
			{ withCredentials: true },
		);
		return res.data;
	} catch (e) {
		console.error(e);
		return null;
	}
};

export default function Page() {
	const { data } = useSWR("proxies", getProxies);
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
				pageSize: 5,
			},
		},
		initialState: {
			columnVisibility: {
				id: false,
			},
		},
		globalFilterFn: "includesString",
	});

	const stateRef = useRef<{
		setOpen: Dispatch<SetStateAction<boolean>>;
		setRoomID: Dispatch<SetStateAction<string | null>>;
	}>(null);

	return (
		<>
			<div className="text-5xl font-bold">Live Manager</div>
			<Card className="w-full">
				<CardContent className="space-y-2">
					<div className="flex items-center justify-end space-x-2">
						<Input
							className="flex-1 h-10"
							placeholder="Search live..."
							value={search ?? ""}
							onChange={(event) => {
								table.setGlobalFilter(String(event.target.value));
								setSearch(event.target.value ? event.target.value : null);
								setPage(0);
							}}
						/>
						<UpdateProxy ref={stateRef} />
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
							stateRef.current?.setRoomID(row.getValue("id"));
							stateRef.current?.setOpen(true);
						}}
					/>
				</CardContent>
			</Card>
		</>
	);
}
