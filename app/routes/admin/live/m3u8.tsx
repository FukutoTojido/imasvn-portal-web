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

export async function clientLoader() {
	try {
		const res = await axios.get(
			`${import.meta.env.VITE_BACKEND_API}/hls/proxy`,
			{ withCredentials: true },
		);
		return res.data;
	} catch (e) {
		console.error(e);
		return null;
	}
}

export default function Page({ loaderData }: Route.ComponentProps) {
	const [submitting, setSubmitting] = useState(false);
	const { handleSubmit, register } = useForm({
		defaultValues: {
			url: "",
		},
		values: {
			url: loaderData,
		},
	});

	const submit = async (data: { url?: string }) => {
		setSubmitting(true);
		try {
			await axios.post(
				`${import.meta.env.VITE_BACKEND_API}/hls/proxy`,
				{
					url: data.url,
				},
				{
					withCredentials: true,
				},
			);
			toast("Stream source saved!");
		} catch (e) {
			console.error(e);
			toast.error("Cannot save stream source");
		}
		setSubmitting(false);
	};

	return (
		<Card className="bg-mantle border-surface-1 w-[500px] max-w-full self-center">
			<form onSubmit={handleSubmit(submit)}>
				<CardHeader aria-describedby={undefined}>
					<CardTitle className="text-text">Set Stream Source</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-5 text-text">
					<div className="flex flex-col gap-2">
						<Label>URL</Label>
						<Input
							{...register("url")}
							className="bg-mantle border-overlay-0 focus-visible:ring-overlay-0 focus-visible:outline-0 text-text"
							autoComplete="off"
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
