import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { GripVertical, Loader2, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import {
	useDeleteEpisode,
	useGetAnimeEpisodes,
} from "~/services/anime.services";
import type { AnimeEpisode } from "~/types";
import UpdateEpisode from "./UpdateEpisode";

const Delete = ({ id, animeId }: { id: number; animeId: number }) => {
	const queryClient = useQueryClient();
	const deleteEpisode = useDeleteEpisode({ id: animeId, episode: id });
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
								await deleteEpisode.mutateAsync();
								toast("Episode deleted");

								queryClient.invalidateQueries({
									queryKey: ["anime", animeId, "episode"],
								});
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

export default function Episodes({ id }: { id: number }) {
	const { data, isLoading } = useGetAnimeEpisodes({ id });
	const queryClient = useQueryClient();
	const [sorted, setSorted] = useState(data);

	useEffect(() => {
		setSorted(data);
	}, [data]);

	const [loading, setLoading] = useState(false);

	return (
		<Card className="w-lg self-center lg:self-start">
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

							queryClient.invalidateQueries({
								queryKey: ["anime", id, "episode"],
							});
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
										<UpdateEpisode key={row.id} animeId={id} episodeId={row.id}>
											<SortableItem value={row.id} asChild>
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
													<TableCell>{row.index}</TableCell>
													<TableCell>{row.title}</TableCell>
													<TableCell className="cursor-pointer">
														<Delete animeId={id} id={row.id} />
													</TableCell>
												</TableRow>
											</SortableItem>
										</UpdateEpisode>
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
			</CardContent>
			<CardFooter>
				<UpdateEpisode animeId={id} episodeId={null}>
					<Button type="button" className="ml-auto">
						New Episode
					</Button>
				</UpdateEpisode>
			</CardFooter>
		</Card>
	);
}
