import axios from "axios";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
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
import { Textarea } from "~/components/ui/textarea";
import type { Route } from "./+types/preview";

export default function Page() {
	const [submitting, setSubmitting] = useState(false);
	const { handleSubmit, register, reset } = useForm({
		defaultValues: {
			mpd: "",
			cookies: "",
			cond: "",
		},
	});

	useEffect(() => {
		const controller = new AbortController();
		try {
			const getShit = async () => {
				const { data } = await axios.get<{
					mpd: string;
					cookies: string;
					cond: string;
				}>(`${import.meta.env.VITE_BACKEND_API}/hls/ooi`, {
					withCredentials: true,
					signal: controller.signal,
				});

				reset({
					mpd: data.mpd,
					cookies: data.cookies,
					cond: data.cond,
				});
			};

			getShit();
		} catch (e) {
			console.error(e);
		}

		return () => {
			controller.abort();
		};
	}, [reset]);

	const submit = async (data: {
		mpd?: string;
		cookies?: string;
		cond?: string;
	}) => {
		setSubmitting(true);
		try {
			await axios.post(
				`${import.meta.env.VITE_BACKEND_API}/hls/ooi`,
				{
					mpd: data.mpd || "",
					cookies: data.cookies || "",
					cond: data.cond || "",
				},
				{
					withCredentials: true,
				},
			);

			toast("HAXX TRIGGERED!");
		} catch (e) {
			console.error(e);
			toast.error("haxx failed");
		}
		setSubmitting(false);
	};

	return (
		<Card className="bg-mantle border-surface-1 w-[500px] max-w-full self-center">
			<form onSubmit={handleSubmit(submit)}>
				<CardHeader aria-describedby={undefined}>
					<CardTitle className="text-text">HAXX</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-5 text-text">
					<div className="flex flex-col gap-2">
						<Label>MPD</Label>
						<Input
							{...register("mpd")}
							className="bg-mantle border-overlay-0 focus-visible:ring-overlay-0 focus-visible:outline-0 text-text"
							autoComplete="off"
						/>
					</div>
					<div className="flex flex-col gap-2">
						<Label>Cookies</Label>
						<Textarea
							{...register("cookies")}
							className="bg-mantle border-overlay-0 focus-visible:ring-overlay-0 focus-visible:outline-0 text-text font-mono resize-none"
							rows={3}
							autoComplete="off"
						/>
					</div>
					<div className="flex flex-col gap-2">
						<Label>X-Condition</Label>
						<Textarea
							{...register("cond")}
							className="bg-mantle border-overlay-0 focus-visible:ring-overlay-0 focus-visible:outline-0 text-text font-mono resize-none"
							rows={3}
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
