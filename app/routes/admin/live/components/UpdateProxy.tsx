import axios from "axios";
import { Loader2 } from "lucide-react";
import {
	type Dispatch,
	type RefObject,
	type SetStateAction,
	useImperativeHandle,
	useState,
} from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
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
import { Textarea } from "~/components/ui/textarea";

export type ProxyData = {
	id?: string | null;
	m3u8?: string;
	name?: string;
	thumbnail?: string;
	stream_type: "hls" | "dash";
	cookies?: string;
	headers?: string;
};

const getProxy = async (id: string | null) => {
	if (!id) return null;
	try {
		const { data: proxy } = await axios.get<ProxyData>(
			`${import.meta.env.VITE_BACKEND_API}/hls/proxies/${id}`,
			{
				withCredentials: true,
			},
		);
		return proxy;
	} catch (e) {
		console.error(e);
		return null;
	}
};

export default function UpdateProxy({
	ref: stateRef,
}: {
	ref: RefObject<{
		setOpen: Dispatch<SetStateAction<boolean>>;
		setRoomID: Dispatch<SetStateAction<string | null>>;
	} | null>;
}) {
	const [open, setOpen] = useState(false);
	const [id, setRoomID] = useState<string | null>(null);

	const [submitting, setSubmitting] = useState(false);
	const { data, isLoading } = useSWR(
		id ? `proxy-${id}` : null,
		async () => await getProxy(id),
	);

	const methods = useForm<Partial<ProxyData>>({
		defaultValues: {
			id,
			m3u8: data?.m3u8,
			name: undefined,
			thumbnail: undefined,
			stream_type: "hls",
			cookies: undefined,
			headers: undefined,
		},
		values: {
			id,
			m3u8: data?.m3u8,
			name: data?.name,
			thumbnail: data?.thumbnail,
			stream_type: data?.stream_type,
			cookies: data?.cookies,
			headers: data?.headers,
		},
	});

	const { handleSubmit, register, reset, watch } = methods;

	const submit = async (data: Partial<ProxyData>) => {
		setSubmitting(true);
		try {
			const payload = {
				url: data.m3u8,
				name: data.name,
				thumbnail: data.thumbnail,
				stream_type: data.stream_type ?? "hls",
				cookies: data.cookies,
				headers: data.headers,
			};
			if (id === null) {
				await axios.post(
					`${import.meta.env.VITE_BACKEND_API}/hls/proxies`,
					{
						id: data.id,
						...payload,
					},
					{
						withCredentials: true,
					},
				);
			}

			if (id !== null) {
				await axios.patch(
					`${import.meta.env.VITE_BACKEND_API}/hls/proxies/${id}`,
					payload,
					{
						withCredentials: true,
					},
				);
				mutate(`proxy-${id}`);
			}

			setOpen(false);
			mutate("proxies");
			setRoomID(null);
			reset();

			toast("Room saved!");
		} catch (e) {
			console.error(e);
			toast.error("Cannot save room");
		}
		setSubmitting(false);
	};

	useImperativeHandle(
		stateRef,
		() => ({
			setOpen,
			setRoomID,
		}),
		[],
	);

	const thumbnail = watch("thumbnail");

	return (
		<FormProvider {...methods}>
			<Dialog
				open={open}
				onOpenChange={(val) => {
					setOpen(val);
					if (!val) setRoomID(null);
				}}
			>
				<DialogTrigger className="w-max" asChild>
					<Button className="bg-text text-crust hover:bg-base hover:text-text self-end font-normal">
						Add Event
					</Button>
				</DialogTrigger>
				<DialogContent
					onOpenAutoFocus={(e) => e.preventDefault()}
					className="bg-base border-surface-1 text-text sm:max-w-full w-[600px]"
				>
					<DialogHeader>
						<DialogTitle>Event</DialogTitle>
						<DialogDescription className="text-subtext-0">
							Add or update a new event
						</DialogDescription>
					</DialogHeader>
					{isLoading ? (
						<Loader2 className="animate-spin" />
					) : (
						<form
							onSubmit={handleSubmit(submit)}
							className="flex flex-col gap-5"
						>
							<Label>Room ID</Label>
							<Input
								{...register("id", { required: true })}
								className="bg-mantle border-overlay-0 focus-visible:ring-overlay-0 focus-visible:outline-0 text-text"
								autoComplete="off"
								disabled={id === "root"}
							/>
							<Label>URL / Content ID</Label>
							<Input
								{...register("m3u8")}
								className="bg-mantle border-overlay-0 focus-visible:ring-overlay-0 focus-visible:outline-0 text-text"
								autoComplete="off"
							/>
							<Label>Room Name</Label>
							<Input
								{...register("name")}
								className="bg-mantle border-overlay-0 focus-visible:ring-overlay-0 focus-visible:outline-0 text-text"
								autoComplete="off"
							/>
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
							<Label>Stream Type</Label>
							<Select
								defaultValue={data?.stream_type}
								onValueChange={(value) =>
									methods.setValue("stream_type", value as "hls" | "dash")
								}
							>
								<SelectTrigger className="w-full bg-mantle border-surface-1 focus-visible:ring-overlay-0">
									<SelectValue placeholder="Stream Type..." />
								</SelectTrigger>
								<SelectContent className="bg-mantle border border-surface-1 text-text">
									<SelectGroup>
										<SelectItem
											value="hls"
											className="data-[highlighted]:bg-surface-0 data-[highlighted]:text-text text-wrap"
										>
											HLS
										</SelectItem>
										<SelectItem
											value="dash"
											className="data-[highlighted]:bg-surface-0 data-[highlighted]:text-text text-wrap"
										>
											DASH
										</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>
							<Label>Cookies</Label>
							<Textarea
								{...register("cookies")}
								className="bg-mantle border-overlay-0 focus-visible:ring-overlay-0 focus-visible:outline-0 text-text font-mono resize-none"
								rows={3}
								autoComplete="off"
							/>
							<Label>Headers</Label>
							<Textarea
								{...register("headers")}
								className="bg-mantle border-overlay-0 focus-visible:ring-overlay-0 focus-visible:outline-0 text-text font-mono resize-none"
								rows={3}
								autoComplete="off"
							/>
							<Button
								type="submit"
								className="w-max bg-text text-crust hover:bg-crust hover:text-text ml-auto"
								disabled={submitting}
							>
								{submitting ? <Loader2 className="animate-spin" /> : ""}
								Save
							</Button>
						</form>
					)}
				</DialogContent>
			</Dialog>
		</FormProvider>
	);
}
