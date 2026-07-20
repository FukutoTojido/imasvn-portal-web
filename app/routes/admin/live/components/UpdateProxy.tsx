import axios from "axios";
import { Loader2 } from "lucide-react";
import { DateTime } from "luxon";
import {
	type Dispatch,
	type RefObject,
	type SetStateAction,
	useImperativeHandle,
	useState,
} from "react";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import { Button } from "~/components/ui/button";
import { DatePicker } from "~/components/ui/date-picker";
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
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";

export type ProxyDataDto = {
	id?: string | null;
	m3u8?: string;
	name?: string;
	thumbnail?: string;
	stream_type: "hls" | "dash" | "whep";
	cookies?: string;
	headers?: string;
	date?: string;
	archive?: boolean;
	forward_url?: string;
};

export type ProxyData = Omit<ProxyDataDto, "date"> & {
	date?: Date;
};

const getProxy = async (id: string | null) => {
	if (!id) return null;
	try {
		const { data: proxy } = await axios.get<ProxyDataDto>(
			`${import.meta.env.VITE_BACKEND_API}/hls/proxies/${id}`,
			{
				withCredentials: true,
			},
		);
		return { ...proxy, date: DateTime.fromISO(proxy.date ?? "").toJSDate() };
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
			date: undefined,
			archive: false,
			forward_url: undefined,
		},
		values: {
			id,
			m3u8: data?.m3u8,
			name: data?.name,
			thumbnail: data?.thumbnail,
			stream_type: data?.stream_type,
			cookies: data?.cookies,
			headers: data?.headers,
			date: data?.date,
			archive: Boolean(data?.archive),
			forward_url: data?.forward_url,
		},
	});

	const { handleSubmit, register, reset, watch, control, setValue } = methods;

	const submit = async (data: Partial<ProxyData>) => {
		setSubmitting(true);
		try {
			const payload = {
				url: data.m3u8,
				name: data.name,
				thumbnail: data.thumbnail,
				stream_type: data.stream_type ?? "hls",
				cookies: data.cookies ?? undefined,
				headers: data.headers ?? undefined,
				archive: data.archive ?? false,
				forward_url: data.forward_url ?? undefined,
				date: data.date,
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
					className="bg-base border-surface-1 text-text sm:max-w-full w-150 max-h-[calc(100%-2rem)] overflow-auto"
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
							className="grid grid-cols-2 gap-5"
						>
							<div className="flex gap-2 flex-col flex-1">
								<Label>Room ID</Label>
								<Input
									{...register("id", { required: true })}
									className="bg-mantle border-overlay-0 focus-visible:ring-overlay-0 focus-visible:outline-0 text-text"
									autoComplete="off"
									disabled={id === "root"}
								/>
							</div>
							<div className="flex gap-2 flex-col flex-1">
								<Label>URL / Content ID</Label>
								<Input
									{...register("m3u8")}
									className="bg-mantle border-overlay-0 focus-visible:ring-overlay-0 focus-visible:outline-0 text-text"
									autoComplete="off"
								/>
							</div>
							<div className="flex flex-col gap-2">
								<Label>Room Name</Label>
								<Input
									{...register("name")}
									className="bg-mantle border-overlay-0 focus-visible:ring-overlay-0 focus-visible:outline-0 text-text"
									autoComplete="off"
								/>
							</div>
							<div className="flex flex-col gap-2">
								<Label>Stream Type</Label>
								<Select
									defaultValue={data?.stream_type}
									onValueChange={(value) =>
										methods.setValue(
											"stream_type",
											value as "hls" | "dash" | "whep",
										)
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
											<SelectItem
												value="whep"
												className="data-[highlighted]:bg-surface-0 data-[highlighted]:text-text text-wrap"
											>
												WHEP
											</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>
							<div className="flex flex-col gap-2">
								<Label>Thumbnail</Label>
								<Input
									{...register("thumbnail")}
									className="bg-mantle border-overlay-0 focus-visible:ring-overlay-0 focus-visible:outline-0 text-text"
									autoComplete="off"
								/>
							</div>
							<div className="flex flex-col gap-2">
								<Label>Date</Label>
								<Controller
									name="date"
									render={({ field: { value, onChange } }) => (
										<DatePicker date={value} setDate={onChange} className="w-full" />
									)}
								/>
							</div>
							<img
								src={(thumbnail ? thumbnail : null) as unknown as string}
								alt=""
								className="rounded-md border border-surface-1 col-span-full"
							/>
							<div className="flex flex-col gap-2 flex-1">
								<Label>Cookies</Label>
								<Textarea
									{...register("cookies")}
									className="bg-mantle border-overlay-0 focus-visible:ring-overlay-0 focus-visible:outline-0 text-text font-mono resize-none"
									rows={3}
									autoComplete="off"
								/>
							</div>
							<div className="flex flex-col gap-2 flex-1">
								<Label>Headers</Label>
								<Textarea
									{...register("headers")}
									className="bg-mantle border-overlay-0 focus-visible:ring-overlay-0 focus-visible:outline-0 text-text font-mono resize-none"
									rows={3}
									autoComplete="off"
								/>
							</div>
							<div className="flex justify-between items-start col-span-full">
								<Label>Archive</Label>
								<Controller
									name="archive"
									render={({ field: { value, onChange } }) => (
										<Switch onCheckedChange={onChange} checked={value} />
									)}
								/>
							</div>
							<Button
								type="submit"
								className="w-max bg-text text-crust hover:bg-crust hover:text-text ml-auto col-span-full"
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
