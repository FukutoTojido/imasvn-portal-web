import axios from "axios";
import * as htmlToImage from "html-to-image";
import { Loader2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import PreviewImage from "../components/PreviewImage";
import { getEvents } from "../events";
import type { Route } from "./+types/page";
import BackCard from "./components/BackCard";
import FrontCard from "./components/FrontCard";
import "./style.css";

type FormType = {
	name: string;
	idol: string;
	idolJapanese: string;
	title: string;
	event: string;
	img?: FileList | null;
	frontImg?: FileList | null;
	backImg?: FileList | null;
};

export const loader = async ({ params: { id } }: Route.LoaderArgs) => {
	try {
		const { data: cardData } = await axios.get(
			`${import.meta.env.VITE_BACKEND_API}/producer-id/_/cards/${id}`,
		);
		const { data: userData } = await axios.get(
			`${import.meta.env.VITE_BACKEND_API}/producer-id/${cardData.pid}`,
		);
		const events = await getEvents();

		return {
			cardData,
			userData,
			events,
		};
	} catch (e) {
		console.error(e);
		return null;
	}
};

export default function Page({ loaderData }: Route.ComponentProps) {
	const ref = useRef<HTMLDivElement>(null);
	const getImageRef = useRef<{ getImage: () => Promise<File | null> }>(null);

	const methods = useForm<FormType>({
		defaultValues: {
			name: "",
			idol: "",
			idolJapanese: "",
			title: "",
			img: null,
			frontImg: null,
			backImg: null,
		},
		values: {
			name: loaderData?.cardData.name ?? loaderData?.userData.name ?? "",
			idol: loaderData?.cardData.idol ?? "",
			idolJapanese: loaderData?.cardData.idolJapanese ?? "",
			event: loaderData?.cardData.event ?? "",
			title: loaderData?.cardData.title ?? "",
			img: null,
			frontImg: null,
			backImg: null,
		},
	});
	const { register, setValue, handleSubmit } = methods;

	const copyImage = useCallback(async () => {
		if (!ref.current) return;
		const imageUrl = await htmlToImage.toPng(ref.current);

		const link = document.createElement("a");
		link.download = "test.png";
		link.href = imageUrl;
		link.click();
	}, []);

	const [submitting, setSubmitting] = useState(false);

	const update = async (formData: FormType) => {
		setSubmitting(true);
		try {
			const payload = new FormData();
			if (formData.name) payload.append("name", formData.name);
			if (formData.idol) payload.append("idol", formData.idol);
			if (formData.idolJapanese)
				payload.append("idolJapanese", formData.idolJapanese);
			if (formData.title) payload.append("title", formData.title);
			if (formData.event) payload.append("event", formData.event);

			if (formData.img) {
				const file = await getImageRef.current?.getImage();
				if (file) {
					payload.append("img", file);
				}
			}

			if (formData.frontImg) {
				payload.append("frontImg", formData.frontImg[0]);
			}

			if (formData.backImg) {
				payload.append("backImg", formData.backImg[0]);
			}

			await axios.patch(
				`${import.meta.env.VITE_BACKEND_API}/producer-id/${loaderData?.userData.id}/cards/${loaderData?.cardData.id}`,
				payload,
				{
					withCredentials: true,
				},
			);
		} catch (e) {
			console.error(e);
		}
		setSubmitting(false);
	};

	return (
		<FormProvider {...methods}>
			<div className="w-full h-full flex gap-5">
				<form
					onSubmit={handleSubmit(update)}
					className="max-w-full w-[500px] h-full bg-base rounded-xl border border-surface-1 p-5 grid grid-cols-2 gap-5"
				>
					<div className="flex flex-col gap-2.5">
						<Label>Producer Name</Label>
						<Input
							{...register("name", { required: true })}
							className="bg-mantle border-overlay-0 focus-visible:ring-overlay-0 focus-visible:outline-0 text-text"
							autoComplete="off"
						/>
					</div>
					<div className="flex flex-col gap-2.5">
						<Label>Title</Label>
						<Input
							{...register("title", { required: true })}
							className="bg-mantle border-overlay-0 focus-visible:ring-overlay-0 focus-visible:outline-0 text-text"
							autoComplete="off"
						/>
					</div>

					<div className="flex flex-1 flex-col gap-2.5">
						<Label>Idol Name</Label>
						<Input
							{...register("idol", { required: true })}
							className="bg-mantle border-overlay-0 focus-visible:ring-overlay-0 focus-visible:outline-0 text-text"
							autoComplete="off"
						/>
					</div>
					<div className="flex flex-1 flex-col gap-2.5">
						<Label>Idol Name (Japanese)</Label>
						<Input
							{...register("idolJapanese", { required: true })}
							className="bg-mantle border-overlay-0 focus-visible:ring-overlay-0 focus-visible:outline-0 text-text"
							autoComplete="off"
						/>
					</div>
					<div className="flex flex-col gap-2.5 col-span-full">
						<Label>Event</Label>
						<Select
							defaultValue={loaderData?.cardData.event?.toString()}
							onValueChange={async (value) => {
								setValue("event", value);
							}}
						>
							<SelectTrigger className="bg-mantle border-surface-1 w-full focus-visible:ring-overlay-0 ">
								<SelectValue
									placeholder="Event..."
									className="placeholder:text-subtext-0"
								/>
							</SelectTrigger>
							<SelectContent className="bg-mantle border border-surface-1 text-text">
								<SelectGroup>
									{(loaderData?.events ?? []).map((event) => (
										<SelectItem
											key={event.id}
											value={event.id.toString()}
											className="data-[highlighted]:bg-surface-0 data-[highlighted]:text-text text-wrap"
										>
											{event.name}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
					<div className="flex flex-col gap-2.5">
						<Label>Front Image</Label>
						<Input
							{...register("frontImg")}
							type="file"
							className="bg-mantle border-overlay-0 focus-visible:ring-overlay-0 focus-visible:outline-0 text-text file:text-subtext-0 cursor-pointer"
							autoComplete="off"
						/>
					</div>
					<div className="flex flex-col gap-2.5">
						<Label>Back Image</Label>
						<Input
							{...register("backImg")}
							type="file"
							className="bg-mantle border-overlay-0 focus-visible:ring-overlay-0 focus-visible:outline-0 text-text file:text-subtext-0 cursor-pointer"
							autoComplete="off"
						/>
					</div>
					<div className="flex flex-col gap-2.5">
						<Label>ID Image</Label>
						<Input
							{...register("img")}
							type="file"
							className="bg-mantle border-overlay-0 focus-visible:ring-overlay-0 focus-visible:outline-0 text-text file:text-subtext-0 cursor-pointer"
							autoComplete="off"
						/>
					</div>
					<PreviewImage url={loaderData?.cardData.img} ref={getImageRef} />
					<div className="col-span-full">
						<Button
							type="submit"
							className="w-full bg-text text-crust hover:bg-crust hover:text-text"
							disabled={submitting}
						>
							{submitting ? <Loader2 className="animate-spin" /> : ""}
							Save
						</Button>
					</div>
				</form>
				<div className="relative h-full overflow-auto flex flex-col items-center gap-5 text-white">
					<FrontCard ref={ref} url={loaderData?.cardData.frontImg} />
					<BackCard
						events={loaderData?.events ?? []}
						url={loaderData?.cardData.backImg}
					/>
					<button
						type="button"
						className="absolute top-0 left-0"
						onClick={() => copyImage()}
					>
						Copy Image
					</button>
				</div>
			</div>
		</FormProvider>
	);
}
