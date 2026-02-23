import axios from "axios";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { Route } from "./+types/preview";

export async function loader() {
	try {
		const res = await axios.get(
			`${import.meta.env.VITE_BACKEND_API}/live/preview`,
		);
		return res.data;
	} catch (e) {
		console.error(e);
		return null;
	}
}

export default function Page({ loaderData }: Route.ComponentProps) {
	const [submitting, setSubmitting] = useState(false);
	const { handleSubmit, register, watch, setValue } = useForm({
		defaultValues: {
			title: "",
			thumbnail: "",
		},
		values: {
			title: loaderData.title,
			thumbnail: loaderData.url,
		},
	});

	const thumbnail = watch("thumbnail");

	const submit = async (data: { title?: string; thumbnail?: string }) => {
		setSubmitting(true);
		try {
			await axios.post(
				`${import.meta.env.VITE_BACKEND_API}/live/preview`,
				{
					title: data.title || "Tsukimura Temari Radio 24/7",
					url: data.thumbnail || "https://cdn.tryz.id.vn/Live%20Image.png",
				},
				{
					withCredentials: true,
				},
			);

			if (!data.title) {
				setValue("title", "Tsukimura Temari Radio 24/7");
			}

			if (!data.thumbnail) {
				setValue("thumbnail", "https://cdn.tryz.id.vn/Live%20Image.png");
			}

			toast("Livestage details saved!");
		} catch (e) {
			console.error(e);
			toast.error("Cannot save livestage details");
		}
		setSubmitting(false);
	};

	return (
		<Card className="bg-mantle border-surface-1 w-[500px] max-w-full self-center">
			<form onSubmit={handleSubmit(submit)}>
				<CardHeader aria-describedby={undefined}>
					<CardTitle className="text-text">Set Livestage Content</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-5 text-text">
					<div className="flex flex-col gap-2">
						<Label>Title</Label>
						<Input
							{...register("title")}
							className="bg-mantle border-overlay-0 focus-visible:ring-overlay-0 focus-visible:outline-0 text-text"
							autoComplete="off"
						/>
					</div>
					<div className="flex flex-col gap-2">
						<Label>Thumbnail</Label>
						<Input
							{...register("thumbnail")}
							className="bg-mantle border-overlay-0 focus-visible:ring-overlay-0 focus-visible:outline-0 text-text"
							autoComplete="off"
						/>
						<img
							src={(thumbnail ? thumbnail : null) as unknown as string}
							alt=""
							className="rounded-md border border-surface-1 "
						/>
					</div>
				</CardContent>
				<CardFooter>
					<Button
						type="submit"
						className="w-max bg-text text-crust hover:bg-crust hover:text-text ml-auto"
						disabled={submitting}
					>
						{submitting ? <Loader2 className="animate-spin" /> : ""}
						Save
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
