import axios from "axios";
import { Loader2 } from "lucide-react";
import { DateTime } from "luxon";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
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

			toast("Update completed!");
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
					<Card className="w-full">
						<CardHeader>
							<CardTitle>Edit Anime</CardTitle>
							<CardDescription></CardDescription>
						</CardHeader>
						<CardContent>
							<div className="w-full grid grid-cols-2 gap-5 auto-rows-auto">
								<div className="flex flex-col gap-2.5">
									<Label>Title</Label>
									<Input {...register("title")} />
								</div>
								<div className="flex flex-col gap-2.5">
									<Label>Title Japanese</Label>
									<Input {...register("titleJapanese")} />
								</div>
								<div className="flex flex-col gap-2.5 col-span-full">
									<Label>Sypnosis</Label>
									<Textarea
										{...register("sypnosis")}
										className="resize-none field-sizing-fixed"
										rows={10}
									/>
								</div>
								<div className="flex flex-col gap-2.5 md:col-span-1 col-span-full">
									<Label>Image</Label>
									<Input type="file" {...register("bg")} />
									<PreviewImage
										url={loaderData.bg}
										className="md:flex-1 p-0 aspect-video"
										cropper={false}
										name="bg"
										imgClassName="object-cover rounded-none"
									/>
								</div>
								<div className="flex flex-col gap-2.5 md:col-span-1 col-span-full">
									<Label>Released Date</Label>
									<Calendar
										selected={date?.toJSDate()}
										defaultMonth={date?.toJSDate()}
										required={true}
										onSelect={(selected) =>
											setValue("time", DateTime.fromJSDate(selected))
										}
										mode="single"
										className="rounded-lg border w-full"
									/>
								</div>
							</div>
						</CardContent>
						<CardFooter>
							<Button type="submit" className="ml-auto">
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
