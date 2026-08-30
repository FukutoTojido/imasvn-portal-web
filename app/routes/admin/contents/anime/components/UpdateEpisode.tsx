import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Loader2, TrashIcon } from "lucide-react";
import { type ReactNode, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
	useCreateEpisode,
	useDeleteContent,
	useEditEpisode,
	useGetEpisode,
} from "~/services/anime.services";
import { getPresignedUrls } from "~/services/r2.services";
import type { AnimeEpisode } from "~/types";

export default function UpdateEpisode({
	animeId,
	episodeId: id,
	children,
}: {
	animeId: number;
	episodeId: number | null;
	children: ReactNode;
}) {
	const [open, setOpen] = useState(false);
	const { data, isLoading } = useGetEpisode({ id: animeId, episode: id });
	const deleteContent = useDeleteContent({
		id: animeId,
		episode: id,
	});
	const createEpisode = useCreateEpisode({ id: animeId });
	const editEpisode = useEditEpisode({ id: animeId, episode: id });
	const queryClient = useQueryClient();

	const presignedsRef = useRef<{ key: string; url: string; file: File }[]>([]);

	const { register, handleSubmit, reset } = useForm<
		Omit<AnimeEpisode, "id" | "animeId">
	>({
		values: {
			title: data?.title ?? "",
			index: data?.index ?? "",
		},
	});

	const [submitting, setSubmitting] = useState(false);
	const [signing, setSigning] = useState(false);
	const [loadingProgress, setLoadingProgress] = useState(0);
	const [deleting, setDeleting] = useState(false);

	const submit = async (formData: Omit<AnimeEpisode, "id" | "animeId">) => {
		const payload = {
			title: formData.title?.trim(),
			index: formData.index?.trim(),
		};

		setSubmitting(true);

		try {
			if (presignedsRef.current.length) {
				setLoadingProgress(0);
				await Promise.all(
					presignedsRef.current.map(async ({ url, file }) => {
						await axios.put(url, file);
						setLoadingProgress((progress) => progress + 1);
					}),
				);
				setLoadingProgress(0);
			}

			await (id === null ? createEpisode : editEpisode).mutateAsync(payload);
			queryClient.invalidateQueries({
				queryKey: ["anime", animeId, "episode"],
			});

			presignedsRef.current = [];

			setOpen(false);
			reset();
		} catch (e) {
			console.error(e);
		}

		setSubmitting(false);
	};

	const mapPresigned = async (
		files: FileList | null,
		keyTransformer: (file: File) => string,
	) => {
		const keys = [...(files ?? [])].map(keyTransformer);

		setSigning(true);
		const pair = await getPresignedUrls(keys);
		setSigning(false);

		const filePresigneds = pair
			.map(([key, url]: [string, string]) => {
				const file = [...(files ?? [])].find(
					(file) => keyTransformer(file) === key,
				);

				if (!file) return null;

				return {
					key,
					url,
					file,
				};
			})
			.filter(
				(
					file: {
						key: string;
						url: string;
						file: File;
					} | null,
				) => file !== null,
			);

		console.log(filePresigneds);

		if (!files || files.length === 0) {
			presignedsRef.current = [];
			return;
		}

		presignedsRef.current = [...presignedsRef.current, ...filePresigneds];
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(val) => {
				setOpen(val);

				if (!val) {
					presignedsRef.current = [];
				}
			}}
		>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
				<DialogHeader>
					<DialogTitle>
						{id === null ? "Add Episode" : "Edit Episode"}
					</DialogTitle>
					<DialogDescription></DialogDescription>
				</DialogHeader>
				{isLoading && <Loader2 className="animate-spin mx-auto" />}
				{data && (
					<form onSubmit={handleSubmit(submit)}>
						<div className="w-full grid grid-cols-3 gap-5">
							<div className="flex flex-col gap-2.5">
								<Label>Index</Label>
								<Input {...register("index", { required: true })} />
							</div>
							<div className="flex flex-col gap-2.5 col-span-2">
								<Label>Title</Label>
								<Input {...register("title", { required: true })} />
							</div>
							{id !== null && (
								<div className="flex flex-col gap-2.5 col-span-3">
									<Label>Upload Folder</Label>
									<Input
										type="file"
										onChange={(e) => {
											mapPresigned(
												e.target.files,
												(file) =>
													`${import.meta.env.VITE_CDN_PREFIX || ""}anime/${animeId}/${id}/${file.webkitRelativePath.split("/").slice(1).join("/")}`,
											);
										}}
										multiple
										// @ts-expect-error
										webkitdirectory="true"
										disabled={submitting}
									/>
									<Label>Upload File</Label>
									<Input
										type="file"
										onChange={async (e) => {
											mapPresigned(
												e.target.files,
												(file) =>
													`${import.meta.env.VITE_CDN_PREFIX || ""}anime/${animeId}/${id}/${file.name}`,
											);
										}}
										disabled={submitting}
									/>
								</div>
							)}
							{id !== null && (
								<div className="flex gap-2 items-center">
									<Badge className="h-full px-4" variant={"secondary"}>
										Uploaded Files: {data?.uploadedFiles ?? 0}
									</Badge>
									<Button
										variant={"destructive"}
										onClick={async () => {
											setDeleting(true);
											await deleteContent.mutateAsync();
											setDeleting(false);
										}}
										type="button"
									>
										{deleting && <Loader2 className="animate-spin" />}
										<TrashIcon />
									</Button>
								</div>
							)}
							{submitting && (
								<div className="h-2 rounded-full col-span-full bg-crust relative">
									<div
										className="absolute top-0 left-0 h-full rounded-full bg-text transition-all"
										style={{
											width: `${(loadingProgress / (presignedsRef.current.length || 1)) * 100}%`,
										}}
									></div>
								</div>
							)}
							<DialogFooter className="col-span-full">
								<Button type="submit" disabled={submitting || signing}>
									{submitting || signing ? (
										<Loader2 className="animate-spin" />
									) : (
										""
									)}
									{!submitting && !signing
										? "Save"
										: submitting
											? "Uploading"
											: "Presigning"}
								</Button>
							</DialogFooter>
						</div>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
