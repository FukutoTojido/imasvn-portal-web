import axios from "axios";
import { Loader2 } from "lucide-react";
import {
	type Dispatch,
	type RefObject,
	type SetStateAction,
	useImperativeHandle,
	useState,
} from "react";
import { useForm } from "react-hook-form";
import useSWR, { mutate } from "swr";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import VideoPlayer from "~/routes/contents/anime/components/VideoPlayer";
import type { AnimeEpisode } from "~/types";

const getEpisode = async (id: number | null, animeId: number) => {
	if (!id) return null;
	try {
		const { data: episode } = await axios.get<AnimeEpisode>(
			`${import.meta.env.VITE_BACKEND_API}/anime/${animeId}/episodes/${id}`,
			{ withCredentials: true },
		);
		return episode;
	} catch (e) {
		console.error(e);
		return null;
	}
};

export default function UpdateEpisode({
	animeId,
	ref: stateRef,
}: {
	animeId: number;
	ref: RefObject<{
		setOpen: Dispatch<SetStateAction<boolean>>;
		setEpisodeId: Dispatch<SetStateAction<number | null>>;
	} | null>;
}) {
	const [open, setOpen] = useState(false);
	const [id, setEpisodeId] = useState<number | null>(null);
	const { data } = useSWR(
		id ? `episode-${id}` : null,
		async () => await getEpisode(id, animeId),
	);

	const { register, handleSubmit, watch } = useForm<
		Omit<AnimeEpisode, "id" | "animeId"> & { video: FileList | null }
	>({
		defaultValues: {
			title: data?.title ?? "",
			index: data?.index ?? "",
			video: null,
		},
		values: {
			title: data?.title ?? "",
			index: data?.index ?? "",
			video: null,
		},
	});

	const video = watch("video");

	useImperativeHandle(
		stateRef,
		() => ({
			setOpen,
			setEpisodeId,
		}),
		[],
	);

	const [submitting, setSubmitting] = useState(false);
	const [loadingProgress, setLoadingProgress] = useState(0);

	const submit = async (
		formData: Omit<AnimeEpisode, "id" | "animeId"> & { video: FileList | null },
	) => {
		const payload = new FormData();
		if (formData.title) payload.append("title", formData.title.trim());
		if (formData.index) payload.append("index", formData.index.trim());
		if (formData.video?.length) payload.append("video", formData.video[0]);

		setSubmitting(true);

		try {
			if (id === null) {
				await axios.post(
					`${import.meta.env.VITE_BACKEND_API}/anime/${animeId}/episodes`,
					payload,
					{
						withCredentials: true,
						onUploadProgress: (progress) => {
							setLoadingProgress(progress.progress ?? 0);
						},
					},
				);
			}

			if (id) {
				await axios.patch(
					`${import.meta.env.VITE_BACKEND_API}/anime/${animeId}/episodes/${id}`,
					payload,
					{
						withCredentials: true,
						onUploadProgress: (progress) => {
							setLoadingProgress(progress.progress ?? 0);
						},
					},
				);
			}

			setLoadingProgress(0);
			mutate(`episodes-${animeId}`);
			setOpen(false);
		} catch (e) {
			console.error(e);
		}

		setSubmitting(false);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(val) => {
				setOpen(val);
				if (!val) setEpisodeId(null);
			}}
		>
			<DialogContent
				onOpenAutoFocus={(e) => e.preventDefault()}
				className="bg-base border-surface-1"
			>
				<DialogHeader>
					<DialogTitle className="text-text">
						{id === null ? "Add Episode" : "Edit Episode"}
					</DialogTitle>
					<DialogDescription></DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit(submit)}>
					<div className="w-full grid grid-cols-3 gap-5">
						<div className="flex flex-col gap-2.5">
							<Label className="text-text">Index</Label>
							<Input
								{...register("index", { required: true })}
								className="dark:text-text dark:bg-mantle"
							/>
						</div>
						<div className="flex flex-col gap-2.5 col-span-2">
							<Label className="text-text">Title</Label>
							<Input
								{...register("title", { required: true })}
								className="dark:text-text dark:bg-mantle"
							/>
						</div>
						<div className="flex flex-col gap-2.5 col-span-3">
							<Label className="text-text">Video File</Label>
							<Input
								type="file"
								{...register("video", { required: !id })}
								className="dark:text-text dark:bg-mantle"
							/>
						</div>
						{id !== null && (
							<div className="col-span-full overflow-hidden rounded-md aspect-video bg-mantle">
								<VideoPlayer
									animeId={animeId}
									episodeId={id}
									src={
										video?.length
											? URL.createObjectURL(new Blob([video[0]]))
											: undefined
									}
								/>
							</div>
						)}
						{submitting && (
							<div className="h-2 rounded-full col-span-full bg-crust relative">
								<div
									className="absolute top-0 left-0 h-full rounded-full bg-text transition-all"
									style={{
										width: `${loadingProgress * 100}%`,
									}}
								></div>
							</div>
						)}
						<DialogFooter className="col-span-full">
							<Button
								type="submit"
								className="bg-text text-mantle hover:bg-subtext-0"
								disabled={submitting}
							>
								{submitting ? <Loader2 className="animate-spin" /> : ""}
								{!submitting
									? "Save"
									: loadingProgress >= 1
										? "Processing"
										: "Uploading"}
							</Button>
						</DialogFooter>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
