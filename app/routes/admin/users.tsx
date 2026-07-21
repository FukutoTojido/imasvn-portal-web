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
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "~/components/ui/combobox";
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
import { getProducers } from "./components/ProducerMenu";
import TableComponent from "./components/Table";

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
	const { data: producers } = useSWR("producers", getProducers);
	const producersList = producers?.map(({ id, name }) => ({
		value: id,
		label: name,
	}));

	const columns: ColumnDef<UserDto>[] = useMemo(
		() => [
			{
				accessorKey: "id",
				header: "Discord ID",
				cell: (props) => props.cell.getValue() as string,
			},
			{
				accessorKey: "avatar",
				header: "Avatar",
				cell: (props) => (
					<Avatar className="w-10 h-10">
						<AvatarFallback className="w-full h-full rounded-full flex items-center justify-center">
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
						<span className="text-xs">@{props.row.original.tag}</span>
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
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Role..." />
						</SelectTrigger>
						<SelectContent position="popper">
							<SelectGroup>
								<SelectItem value={ROLE.NORMAL.toString()}>Normal</SelectItem>
								<SelectItem value={ROLE.ADMIN.toString()}>
									Administrator
								</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
				),
			},
			{
				accessorKey: "pid",
				header: "Linked Producer ID",
				cell: (props) => (
					<Combobox
						defaultValue={producersList?.find(
							(p) => p.value === props.getValue(),
						)}
						items={producersList}
						onValueChange={async (value) => {
							if (value === null) return;
							try {
								await axios.patch(
									`${import.meta.env.VITE_BACKEND_API}/users/${props.row.original.id}/pid`,
									{
										pid:
											value.value === props.row.original.pid
												? null
												: value.value,
									},
									{ withCredentials: true },
								);
								mutate();
							} catch (e) {
								console.error(e);
							}
						}}
					>
						<ComboboxInput placeholder="Link Producer" />
						<ComboboxContent>
							<ComboboxEmpty>No producer ID found.</ComboboxEmpty>
							<ComboboxList>
								{(item) => (
									<ComboboxItem key={item.value} value={item}>
										{item.label}
									</ComboboxItem>
								)}
							</ComboboxList>
						</ComboboxContent>
					</Combobox>
				),
			},
		],
		[mutate, producersList],
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
			columnVisibility: {
				tag: false,
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

	return (
		<>
			<div className="text-5xl font-bold">Portal Users Manager</div>
			<Card className="w-full">
				<CardContent className="space-y-2">
					<div className="flex items-center justify-end space-x-2">
						<Input
							className="flex-1 h-[40px]"
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
				</CardContent>
			</Card>
		</>
	);
}
