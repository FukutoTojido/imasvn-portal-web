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

export type ProxyData = {
	id?: string | null;
	m3u8?: string;
	name?: string;
	thumbnail?: string;
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

	const methods = useForm({
		defaultValues: {
			id,
			m3u8: data?.m3u8,
			name: undefined,
			thumbnail: undefined,
		},
		values: {
			id,
			m3u8: data?.m3u8,
			name: data?.name,
			thumbnail: data?.thumbnail,
		},
	});

	const { handleSubmit, register, reset, watch } = methods;

	const submit = async (data: ProxyData) => {
		setSubmitting(true);
		try {
			if (id === null) {
				await axios.post(
					`${import.meta.env.VITE_BACKEND_API}/hls/proxies`,
					{
						id: data.id,
						url: data.m3u8,
						name: data.name,
						thumbnail: data.thumbnail,
					},
					{
						withCredentials: true,
					},
				);
			}

			if (id !== null) {
				await axios.patch(
					`${import.meta.env.VITE_BACKEND_API}/hls/proxies/${id}`,
					{ url: data.m3u8, name: data.name, thumbnail: data.thumbnail },
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
							<Label>URL</Label>
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
