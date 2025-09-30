import axios from "axios";
import { DateTime } from "luxon";
import { FormProvider, useForm } from "react-hook-form";
import { Calendar } from "~/components/ui/calendar";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import ErrorComponent from "~/routes/components/Error";
import type { Anime } from "~/types";
import PreviewImage from "../../components/PreviewImage";
import type { Route } from "./+types/page";
import { Button } from "~/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import Episodes from "./components/Episodes";

export type AnimeDto = Omit<Anime, "time"> & { time: string };

export async function clientLoader({
	params,
}: Route.ClientLoaderArgs): Promise<AnimeDto | null> {
	try {
		const { data: anime } = await axios.get<AnimeDto>(
			`${import.meta.env.VITE_BACKEND_API}/anime/${params.id}`,
			{ withCredentials: true },
		);
		return anime;
	} catch (e) {
		console.error(e);
		return null;
	}
}

export default function Page({
	loaderData,
}: Omit<Route.ComponentProps, "loaderData"> & { loaderData: AnimeDto | null }) {
	const methods = useForm<Omit<Anime, "bg" | "id"> & { bg?: FileList }>({
		defaultValues: {
			title: loaderData?.title ?? "",
			titleJapanese: loaderData?.titleJapanese ?? "",
			sypnosis: loaderData?.sypnosis ?? "",
			bg: undefined,
			time: loaderData?.time ? DateTime.fromISO(loaderData.time) : undefined,
		},
	});

	const { register, handleSubmit, watch, setValue } = methods;

	const date = watch("time");

	const [submitting, setSubmitting] = useState(false);

	const submit = async (
		formData: Omit<Anime, "bg" | "episodes" | "id"> & { bg?: FileList },
	) => {
		const payload = {
			title: formData.title ? formData.title : (loaderData?.title ?? ""),
			titleJapanese: formData.titleJapanese
				? formData.titleJapanese
				: (loaderData?.titleJapanese ?? ""),
			sypnosis: formData.sypnosis
				? formData.sypnosis
				: (loaderData?.sypnosis ?? ""),
			bg: formData.bg?.[0] ? formData.bg[0] : undefined,
			time: formData.time
				? formData.time.toJSDate()
				: (loaderData?.time ?? undefined),
		};

		const data = new FormData();
		for (const [key, value] of Object.entries(payload)) {
			if (!value) continue;
			data.append(key, value as string);
		}

		setSubmitting(true);
		try {
			await axios.patch(
				`${import.meta.env.VITE_BACKEND_API}/anime/${loaderData?.id}`,
				data,
				{ withCredentials: true },
			);
		} catch (e) {
			console.error(e);
		}
		setSubmitting(false);
	};

	if (!loaderData) return <ErrorComponent />;

	return (
		<div className="flex gap-5 md:flex-row flex-col">
			<FormProvider {...methods}>
				<form
					onSubmit={handleSubmit(submit)}
					className="self-center w-[600px] max-w-full shrink-0"
				>
					<Card className="w-full border-surface-1 bg-base">
						<CardHeader>
							<CardTitle className="text-text">Edit Anime</CardTitle>
							<CardDescription></CardDescription>
						</CardHeader>
						<CardContent>
							<div className="w-full grid grid-cols-2 gap-5 auto-rows-auto">
								<div className="flex flex-col gap-2.5">
									<Label className="text-text">Title</Label>
									<Input
										{...register("title")}
										className="text-text dark:bg-mantle"
									/>
								</div>
								<div className="flex flex-col gap-2.5">
									<Label className="text-text">Title Japanese</Label>
									<Input
										{...register("titleJapanese")}
										className="text-text dark:bg-mantle"
									/>
								</div>
								<div className="flex flex-col gap-2.5 col-span-full">
									<Label className="text-text">Sypnosis</Label>
									<Textarea
										{...register("sypnosis")}
										className="text-text bg-mantle resize-none"
										rows={10}
									/>
								</div>
								<div className="flex flex-col gap-2.5 md:col-span-1 col-span-full">
									<Label className="text-text">Image</Label>
									<Input
										type="file"
										{...register("bg")}
										className="text-text dark:bg-mantle"
									/>
									<PreviewImage
										url={loaderData.bg}
										className="md:flex-1 p-0 aspect-video"
										cropper={false}
										name="bg"
										imgClassName="object-cover rounded-none"
									/>
								</div>
								<div className="flex flex-col gap-2.5 md:col-span-1 col-span-full">
									<Label className="text-text">Released Date</Label>
									<Calendar
										selected={date?.toJSDate()}
										required={true}
										onSelect={(selected) =>
											setValue("time", DateTime.fromJSDate(selected))
										}
										mode="single"
										className="rounded-xl bg-mantle border-surface-1 text-text border w-full"
									/>
								</div>
							</div>
						</CardContent>
						<CardFooter>
							<Button
								type="submit"
								className="bg-text text-mantle hover:bg-subtext-0 ml-auto"
							>
								{submitting ? <Loader2 className="animate-spin" /> : ""}
								Save
							</Button>
						</CardFooter>
					</Card>
				</form>
			</FormProvider>
			<Episodes id={loaderData.id} />
		</div>
	);
}
