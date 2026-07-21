import axios from "axios";
import { GripVertical, Loader2, Trash } from "lucide-react";
import {
	type Dispatch,
	type SetStateAction,
	useEffect,
	useRef,
	useState,
} from "react";
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
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import {
	Sortable,
	SortableContent,
	SortableItem,
	SortableItemHandle,
	SortableOverlay,
} from "~/components/ui/sortable";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { type AnimeEpisode, EPISODE_STATE } from "~/types";
import UpdateEpisode from "./UpdateEpisode";

const Delete = ({ id, animeId }: { id: number; animeId: number }) => {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant={"ghost"}>
					<Trash />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Deleting Episode?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone and will permanently delete this
						episode from the server.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={async () => {
							try {
								await axios.delete(
									`${import.meta.env.VITE_BACKEND_API}/anime/${animeId}/episodes/${id}`,
									{ withCredentials: true },
								);
								toast("Episode deleted");
								mutate(`episodes-${animeId}`);
							} catch (e) {
								console.error(e);
								toast.error("Cannot delete episode");
							}
						}}
					>
						Continue
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

const getEpisodes = async (id: number) => {
	if (!id) return null;
	try {
		const { data: episodes } = await axios.get<AnimeEpisode[]>(
			`${import.meta.env.VITE_BACKEND_API}/anime/${id}/episodes/`,
			{ withCredentials: true },
		);
		return episodes;
	} catch (e) {
		console.error(e);
		return null;
	}
};

export default function Episodes({ id }: { id: number }) {
	const { data, isLoading } = useSWR(
		`episodes-${id}`,
		async () => await getEpisodes(id),
	);
	const [sorted, setSorted] = useState(data);

	const stateRef = useRef<{
		setOpen: Dispatch<SetStateAction<boolean>>;
		setEpisodeId: Dispatch<SetStateAction<number | null>>;
	}>(null);

	useEffect(() => {
		setSorted(data);
	}, [data]);

	const [loading, setLoading] = useState(false);

	return (
		<Card className="flex-1">
			<CardHeader>
				<CardTitle>Edit Episodes</CardTitle>
			</CardHeader>
			<CardContent className="flex-1">
				<Sortable
					value={sorted ?? ([] as AnimeEpisode[])}
					getItemValue={(item) => item.id}
					onValueChange={async (items) => {
						setLoading(true);

						try {
							await axios.patch(
								`${import.meta.env.VITE_BACKEND_API}/anime/${id}/episodes/`,
								{
									order: items.map(({ id }, idx) => ({ id, ord: idx })),
								},
								{ withCredentials: true },
							);

							mutate(`episodes-${id}`);
						} catch (e) {
							console.error(e);
						}

						setLoading(false);
					}}
				>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead />
								<TableHead>Index</TableHead>
								<TableHead>Title</TableHead>
								<TableHead>State</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<SortableContent asChild>
							<TableBody>
								{isLoading || loading ? (
									<TableRow>
										<TableCell colSpan={5} className="h-24 text-center">
											<Loader2 className="animate-spin mx-auto" />
										</TableCell>
									</TableRow>
								) : sorted?.length ? (
									sorted.map((row) => (
										<SortableItem key={row.id} value={row.id} asChild>
											<TableRow>
												<TableCell className="w-[50px]">
													<SortableItemHandle asChild>
														<Button
															variant="ghost"
															size="icon"
															className="size-8"
														>
															<GripVertical className="h-4 w-4" />
														</Button>
													</SortableItemHandle>
												</TableCell>
												<TableCell
													className="cursor-pointer"
													onClick={() => {
														stateRef.current?.setEpisodeId(row.id);
														stateRef.current?.setOpen(true);
													}}
												>
													{row.index}
												</TableCell>
												<TableCell
													className="cursor-pointer"
													onClick={() => {
														stateRef.current?.setEpisodeId(row.id);
														stateRef.current?.setOpen(true);
													}}
												>
													{row.title}
												</TableCell>
												<TableCell
													className="cursor-pointer"
													onClick={() => {
														stateRef.current?.setEpisodeId(row.id);
														stateRef.current?.setOpen(true);
													}}
												>
													{row.state === EPISODE_STATE.PROCESSING &&
														"Processing"}
													{row.state === EPISODE_STATE.READY && "Ready"}
													{row.state === null ||
														(row.state === undefined && "Unknown")}
												</TableCell>
												<TableCell className="cursor-pointer">
													<Delete animeId={id} id={row.id} />
												</TableCell>
											</TableRow>
										</SortableItem>
									))
								) : (
									<TableRow>
										<TableCell colSpan={5} className="h-24 text-center">
											No results.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</SortableContent>
					</Table>
					<SortableOverlay>
						<div className="size-full rounded-none bg-primary/10" />
					</SortableOverlay>
				</Sortable>
				<UpdateEpisode ref={stateRef} animeId={id} />
			</CardContent>
			<CardFooter>
				<Button
					type="button"
					className="ml-auto"
					onClick={() => {
						stateRef.current?.setEpisodeId(null);
						stateRef.current?.setOpen(true);
					}}
				>
					New Episode
				</Button>
			</CardFooter>
		</Card>
	);
}
