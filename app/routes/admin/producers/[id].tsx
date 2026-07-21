import {
	type ColumnDef,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import { Copy, IdCard, Link, LoaderCircle, Trash } from "lucide-react";
import QRCode from "qrcode";
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
import { Card as CardComponent, CardContent } from "~/components/ui/card";
import ErrorComponent from "~/routes/components/Error";
import TableComponent from "../components/Table";
import type { Card, Producer } from "../types";
import type { Route } from "./+types/page";

const columns: ColumnDef<Card>[] = [
	{
		accessorKey: "id",
		header: "Card ID",
	},
	{
		accessorKey: "img",
		header: "Logo",
		cell: (props) => (
			<img
				src={props.cell.getValue() as string}
				alt=""
				className="w-[80px] rounded-md"
			/>
		),
	},
	{
		accessorKey: "name",
		header: "Name on card",
	},
	{
		accessorKey: "idol",
		header: "Registered Idol",
	},
	{
		accessorKey: "title",
		header: "Registered Title",
	},
	{
		id: "actions",
		header: "Actions",
		cell: (props) => (
			<div className="flex gap-5">
				<Button
					variant={"ghost"}
					onClick={async (e) => {
						e.stopPropagation();
						await navigator.clipboard.writeText(
							props.row.original.id.match(/.{1,4}/g)?.join("-") ?? "",
						);
						toast("ID copied");
					}}
				>
					<IdCard />
				</Button>
				<Button
					variant={"ghost"}
					onClick={async (e) => {
						e.stopPropagation();
						await navigator.clipboard.writeText(
							await QRCode.toString(
								`${import.meta.env.VITE_BASE_URL}/producer-id/${props.row.original.id}`,
								{
									type: "svg",
									color: {
										light: "#ffffff00",
										dark: "#ffffffff",
									},
									margin: 0,
									width: 320,
								},
							),
						);
						toast("QR code copied");
					}}
				>
					<Copy />
				</Button>
				<Button
					variant={"ghost"}
					onClick={async (e) => {
						e.stopPropagation();
						await navigator.clipboard.writeText(
							`${import.meta.env.VITE_BASE_URL}/producer-id/${props.row.original.id}`,
						);
						toast("URL copied");
					}}
				>
					<Link />
				</Button>
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button variant={"ghost"}>
							<Trash />
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Deleting Card?</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone and will permanently delete this
								card entry from the server.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								onClick={async () => {
									try {
										await axios.delete(
											`${import.meta.env.VITE_BACKEND_API}/producer-id/${props.row.original.pid}/cards/${props.row.original.id}`,
											{ withCredentials: true },
										);
										toast("Card deleted");
										mutate(`producer-${props.row.original.pid}`);
									} catch (e) {
										console.error(e);
										toast.error("Cannot remove card");
									}
								}}
							>
								Continue
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		),
	},
];

export default function Page({ params }: Route.ComponentProps) {
	const navigate = useNavigate();

	const { data } = useSWR(`producer-${params.id}`, async () => {
		try {
			const [{ data: producerData }, { data: cards }] = [
				await axios.get<Producer>(
					`${import.meta.env.VITE_BACKEND_API}/producer-id/${params.id}`,
					{
						withCredentials: true,
					},
				),
				await axios.get<Card[]>(
					`${import.meta.env.VITE_BACKEND_API}/producer-id/${params.id}/cards`,
					{
						withCredentials: true,
					},
				),
			];
			return { producerData, cards };
		} catch (e) {
			console.error(e);
			return null;
		}
	});

	const [loading, setLoading] = useState(false);

	const table = useReactTable({
		data: data?.cards ?? [],
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	const insertCard = async (id: string) => {
		const { data } = await axios.post(
			`${import.meta.env.VITE_BACKEND_API}/producer-id/${id}/cards`,
			undefined,
			{
				withCredentials: true,
			},
		);

		navigate(`/admin/cards/${data}`);
	};

	if (data === null) return <ErrorComponent />;
	if (!data) return "";

	const { producerData } = data;

	return (
		<>
			<div className="flex flex-col gap-2.5">
				<div className="text-5xl font-medium">{producerData.name}</div>
				<div className="text-xl">Producer ID: {producerData.id}</div>
			</div>
			<Button
				disabled={loading}
				onClick={async () => {
					setLoading(true);
					await insertCard(producerData.id);
					setLoading(false);
				}}
			>
				{loading && <LoaderCircle className="animate-spin" />} Insert Card
			</Button>
			<CardComponent>
				<CardContent>
					<TableComponent
						table={table}
						columns={columns}
						onRowClick={(row) => {
							navigate(`/admin/cards/${row.getValue("id")}`);
						}}
					/>
				</CardContent>
			</CardComponent>
		</>
	);
}
