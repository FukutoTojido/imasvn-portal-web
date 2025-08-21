import {
	type ColumnDef,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import { Trash } from "lucide-react";
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
import AddProducer from "./components/AddProducer";
import TableComponent from "./components/Table";
import type { Producer } from "./types";

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
						<Button className="text-text bg-transparent hover:bg-text hover:text-base">
							<Trash />
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent className="bg-base border-surface-1 text-text">
						<AlertDialogHeader>
							<AlertDialogTitle>Deleting Producer?</AlertDialogTitle>
							<AlertDialogDescription className="text-subtext-0">
								This action cannot be undone and will permanently delete this
								producer entry from the server.
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
											`${import.meta.env.VITE_BACKEND_API}/producer-id/${props.row.original.id}`,
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

const getProducers = async () => {
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

export default function Page() {
	const { data, mutate } = useSWR("producers", getProducers);

	const table = useReactTable({
		data: data ?? [],
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	const navigate = useNavigate();

	return (
		<>
			<div className="text-5xl font-medium text-text">Producer ID Manager</div>
			<div className="w-full p-2.5 border border-surface-1 rounded-xl bg-base">
				<TableComponent
					table={table}
					columns={columns}
					onRowClick={(row) =>
						navigate(`/admin/producer-id/${row.getValue("id")}`)
					}
				/>
			</div>
			<AddProducer mutate={mutate} />
		</>
	);
}
