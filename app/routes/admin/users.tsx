import {
	type ColumnDef,
	type ColumnFiltersState,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { ROLE, type UserDto } from "~/types";
import TableComponent from "./components/Table";
import { Avatar, AvatarImage } from "~/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";

const getUsers = async () => {
	try {
		const { data } = await axios.get(
			`${import.meta.env.VITE_BACKEND_API}/users`,
			{ withCredentials: true },
		);
		return data;
	} catch (e) {
		console.error(e);
		return [];
	}
};

export default function Page() {
	const { data, mutate } = useSWR("users", getUsers);

	const columns: ColumnDef<UserDto>[] = useMemo(
		() => [
			{
				accessorKey: "id",
				header: "Discord ID",
				cell: (props) => (
					<div className="w-[40px]">{props.cell.getValue() as string}</div>
				),
			},
			{
				accessorKey: "avatar",
				header: "Avatar",
				cell: (props) => (
					<Avatar className="w-10 h-10">
						<AvatarFallback className="w-full h-full rounded-full bg-crust text-subtext-0 flex items-center justify-center">
							<ImageOff size={16} />
						</AvatarFallback>
						<AvatarImage src={props.cell.getValue() as string} />
					</Avatar>
				),
			},
			{
				accessorKey: "tag",
				header: "Tag",
			},
			{
				accessorKey: "username",
				header: "Username",
				cell: (props) => (
					<div className="flex flex-col">
						<span>{props.getValue() as string}</span>
						<span className="text-subtext-0 text-xs">
							@{props.row.original.tag}
						</span>
					</div>
				),
			},
			{
				accessorKey: "role",
				header: "Role",
				cell: (props) => (
					<Select
						defaultValue={(props.getValue() as ROLE)?.toString()}
						onValueChange={async (value) => {
							const role = +value as ROLE;

							try {
								await axios.patch(
									`${import.meta.env.VITE_BACKEND_API}/users/${props.row.original.id}/roles`,
									{ role },
									{ withCredentials: true },
								);
							} catch (e) {
								console.error(e);
							}

							mutate("users");
						}}
					>
						<SelectTrigger className="bg-mantle border-surface-1 w-[200px] focus-visible:ring-overlay-0 ">
							<SelectValue
								placeholder="Role..."
								className="placeholder:text-subtext-0"
							/>
						</SelectTrigger>
						<SelectContent className="bg-mantle border border-surface-1 text-text">
							<SelectGroup>
								<SelectItem
									value={ROLE.NORMAL.toString()}
									className="data-[highlighted]:bg-surface-0 data-[highlighted]:text-text"
								>
									Normal
								</SelectItem>
								<SelectItem
									value={ROLE.ADMIN.toString()}
									className="data-[highlighted]:bg-surface-0 data-[highlighted]:text-text"
								>
									Administrator
								</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
				),
			},
		],
		[mutate],
	);

	const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(0));
	const [filter, setFilter] = useQueryState("filter");
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
		filter ? [{ id: "username", value: filter }] : [],
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
				tag: false,
			},
		},
		state: {
			columnFilters,
		},
	});

	return (
		<>
			<div className="text-5xl font-medium text-text">Portal Users Manager</div>
			<div className="w-full p-2.5 border border-surface-1 rounded-xl bg-base flex flex-col gap-2.5">
				<div className="flex items-center justify-end space-x-2">
					<Input
						className="flex-1 bg-mantle border border-overlay-0 text-text h-[40px]"
						placeholder="Search producer..."
						value={
							(table.getColumn("username")?.getFilterValue() as string) ?? ""
						}
						onChange={(event) => {
							table.getColumn("username")?.setFilterValue(event.target.value);
							setFilter(event.target.value ? event.target.value : null);
						}}
					/>
				</div>
				<TableComponent table={table} columns={columns} />
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
