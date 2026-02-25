import {
	type ColumnDef,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import { ChevronLeft, ChevronRight, Trash } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { type Dispatch, type SetStateAction, useRef } from "react";
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
import TableComponent from "../components/Table";
import type { ProxyData } from "./components/UpdateProxy";
import UpdateProxy from "./components/UpdateProxy";

const columns: ColumnDef<ProxyData>[] = [
	{
		accessorKey: "id",
		header: "Room ID",
	},
	{
		accessorKey: "name",
		header: "Room Name",
	},
	{
		id: "actions",
		header: "Actions",
		cell: (props) => {
			return (
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button
							className="text-text bg-transparent hover:bg-text hover:text-base"
							disabled={props.row.original.id === "root"}
						>
							<Trash />
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent className="bg-base border-surface-1 text-text">
						<AlertDialogHeader>
							<AlertDialogTitle>Deleting Proxy?</AlertDialogTitle>
							<AlertDialogDescription className="text-subtext-0">
								This action cannot be undone and will permanently delete this
								proxy entry from the server.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel className="bg-text text-mantle hover:bg-subtext-0">
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction
								className="bg-crust text-text hover:bg-surface-0"
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

	const table = useReactTable({
		data: data ?? [],
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		initialState: {
			pagination: {
				pageIndex: page,
			},
			columnVisibility: {
				id: false,
			},
		},
	});

	const stateRef = useRef<{
		setOpen: Dispatch<SetStateAction<boolean>>;
		setRoomID: Dispatch<SetStateAction<string | null>>;
	}>(null);

	return (
		<>
			<div className="text-5xl font-medium text-text">Events Manager</div>
			<div className="w-full p-2.5 border border-surface-1 rounded-xl bg-base flex flex-col gap-2.5">
				<div className="flex items-center justify-end space-x-2">
					<UpdateProxy ref={stateRef} />
				</div>
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
					onRowClick={(row) => {
						stateRef.current?.setRoomID(row.getValue("id"));
						stateRef.current?.setOpen(true);
					}}
				/>
			</div>
		</>
	);
}
