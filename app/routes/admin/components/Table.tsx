import {
	type ColumnDef,
	flexRender,
	type Row,
	type Table as TableType,
} from "@tanstack/react-table";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";

export default function TableComponent<T>({
	table,
	columns,
	onRowClick,
}: {
	table: TableType<T>;
	columns: ColumnDef<T>[];
	onRowClick?: (row: Row<T>) => void;
}) {
	return (
		<Table>
			<TableHeader className="[&_tr]:border-b-overlay-2">
				{table.getHeaderGroups().map((headerGroup) => (
					<TableRow
						key={headerGroup.id}
						className="hover:bg-surface-0 rounded-xl"
					>
						{headerGroup.headers.map((header) => {
							return (
								<TableHead key={header.id} className="text-text">
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
								</TableHead>
							);
						})}
					</TableRow>
				))}
			</TableHeader>
			<TableBody className="[&_tr]:border-b-surface-2">
				{table.getRowModel().rows?.length ? (
					table.getRowModel().rows.map((row) => (
						<TableRow
							key={row.id}
							data-state={row.getIsSelected() && "selected"}
							className="hover:bg-surface-0 rounded-xl has-[button:hover]:bg-transparent"
						>
							{row.getVisibleCells().map((cell) => (
								<TableCell
									key={cell.id}
									className="text-text cursor-pointer"
									onClick={() => {
										if (cell.column.columnDef.id === "actions") return;
										onRowClick?.(row);
									}}
								>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</TableCell>
							))}
						</TableRow>
					))
				) : (
					<TableRow className="hover:bg-surface-0">
						<TableCell
							colSpan={columns.length}
							className="h-24 text-center text-text"
						>
							No results.
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}
