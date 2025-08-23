import {
	type ColumnDef,
	type ColumnFiltersState,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	type RowSelectionState,
	useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import useSWR from "swr";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import type { Producer } from "../types";
import TableComponent from "./Table";

export const getProducers = async () => {
	try {
		const { data } = await axios.get<Producer[]>(
			`${import.meta.env.VITE_BACKEND_API}/producer-id`,
		);
		return data;
	} catch (e) {
		console.error(e);
		return [];
	}
};

export default function ProducerMenu({
	participants = [],
}: {
	participants?: string[];
}) {
	const { data } = useSWR("producers", getProducers);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>(
		participants.reduce(
			(accm, curr) => {
				accm[curr] = true;
				return accm;
			},
			{} as Record<string, boolean>,
		),
	);
	const { setValue } = useFormContext();

	const columns: ColumnDef<Producer>[] = useMemo(
		() => [
			{
				id: "select",
				header: ({ table }) => (
					<Checkbox
						checked={
							table.getIsAllPageRowsSelected() ||
							(table.getIsSomePageRowsSelected() && "indeterminate")
						}
						onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
						aria-label="Select all"
					/>
				),
				cell: ({ row }) => (
					<Checkbox checked={row.getIsSelected()} aria-label="Select row" />
				),
			},
			{
				accessorKey: "name",
				header: "Producer Name",
			},
		],
		[],
	);

	const table = useReactTable({
		data: data ?? [],
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		onRowSelectionChange: setRowSelection,
		getRowId: (row) => row.id,
		state: {
			columnFilters,
			rowSelection,
		},
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: I know what I'm doing ninja
	useEffect(() => {
		setValue("participants", Object.keys(rowSelection));
	}, [rowSelection]);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button className="bg-mantle border border-overlay-0 hover:bg-surface-0 text-text text-left line-clamp-1 text-ellipsis">
					{table
						.getSelectedRowModel()
						.rows.map((row) => row.original.name)
						.join(", ")}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) p-2.5 border border-surface-1 bg-mantle flex flex-col gap-2.5 shadow-md">
				<div className="flex items-center justify-end space-x-2">
					<Input
						className="flex-1 bg-mantle border border-overlay-0 text-text h-full"
						placeholder="Search producer..."
						value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
						onChange={(event) => {
							table.getColumn("name")?.setFilterValue(event.target.value);
						}}
					/>
				</div>
				<TableComponent
					table={table}
					columns={columns}
					onRowClick={(row) => row.toggleSelected(!row.getIsSelected())}
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
						}}
						disabled={!table.getCanPreviousPage()}
					>
						<ChevronLeft />
					</Button>
					<Button
						className="bg-text text-mantle hover:bg-subtext-0 disabled:bg-crust disabled:text-text"
						onClick={() => {
							table.nextPage();
						}}
						disabled={!table.getCanNextPage()}
					>
						<ChevronRight />
					</Button>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
