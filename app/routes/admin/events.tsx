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
import TableComponent from "./components/Table";
import UpdateEvent, { type EventData } from "./components/UpdateEvent";

const columns: ColumnDef<EventData>[] = [
	{
		accessorKey: "id",
		header: "Event ID",
	},
	{
		accessorKey: "img",
		header: "Logo",
		cell: (props) => (
			<img
				src={props.cell.getValue() as string}
				alt=""
				className="w-[80px] m-4"
			/>
		),
	},
	{
		accessorKey: "name",
		header: "Event Name",
		cell: (props) => (
			<div className="w-[500px] text-wrap">
				{props.cell.getValue() as string}
			</div>
		),
	},
	{
		accessorKey: "startDate",
		header: "Start Date",
		cell: (props) =>
			DateTime.fromISO(props.cell.getValue() as string).toFormat("dd-MM-yyyy"),
	},
	{
		accessorKey: "endDate",
		header: "End Date",
		cell: (props) =>
			DateTime.fromISO(props.cell.getValue() as string).toFormat("dd-MM-yyyy"),
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
											`${import.meta.env.VITE_BACKEND_API}/events/${props.row.original.id}`,
											{ withCredentials: true },
										);
										toast("Event deleted");
										mutate("events");
									} catch (e) {
										console.error(e);
										toast.error("Cannot remove event");
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

export const getEvents = async () => {
	try {
		const { data } = await axios.get<EventData[]>(
			`${import.meta.env.VITE_BACKEND_API}/events`,
		);
		return data;
	} catch (e) {
		console.error(e);
		return [];
	}
};

export default function Page() {
	const { data } = useSWR("events", getEvents);
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
		},
	});

	const stateRef = useRef<{
		setOpen: Dispatch<SetStateAction<boolean>>;
		setEventId: Dispatch<SetStateAction<number | null>>;
	}>(null);

	return (
		<>
			<div className="text-5xl font-bold">Events Manager</div>
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
						<UpdateEvent ref={stateRef} />
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
							stateRef.current?.setEventId(row.getValue("id"));
							stateRef.current?.setOpen(true);
						}}
					/>
				</CardContent>
			</Card>
		</>
	);
}
