import axios from "axios";
import { Loader2 } from "lucide-react";
import {
	type Dispatch,
	type RefObject,
	type SetStateAction,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import type { DateRange } from "react-day-picker";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import useSWR, { mutate } from "swr";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
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
import PreviewImage from "./PreviewImage";
import ProducerMenu from "./ProducerMenu";

export type EventData = {
	id: number;
	name: string;
	startDate: Date;
	endDate: Date;
	img: string;
};

type EventForm = {
	name: string;
	dateRange?: DateRange;
	img: FileList | null;
};

const getEvent = async (id: number | null) => {
	if (!id) return null;
	try {
		const { data: event } = await axios.get<EventData>(
			`${import.meta.env.VITE_BACKEND_API}/events/${id}`,
		);
		return event;
	} catch (e) {
		console.error(e);
		return null;
	}
};

export default function UpdateEvent({
	ref: stateRef,
}: {
	ref: RefObject<{
		setOpen: Dispatch<SetStateAction<boolean>>;
		setEventId: Dispatch<SetStateAction<number | null>>;
	} | null>;
}) {
	const [open, setOpen] = useState(false);
	const [id, setEventId] = useState<number | null>(null);

	const { data, isLoading } = useSWR(
		id ? `event-${id}` : null,
		async () => await getEvent(id),
	);

	const methods = useForm<EventForm>({
		defaultValues: {
			name: "",
			dateRange: {
				from: new Date(),
				to: new Date(),
			},
			img: null,
		},
		values: {
			name: data?.name ?? "",
			dateRange: {
				from: data?.startDate,
				to: data?.endDate,
			},
			img: null,
		},
	});

	const [submitting, setSubmitting] = useState(false);
	const ref = useRef(null);
	const { register, handleSubmit, reset, setValue } = methods;
	const date = useWatch<EventForm>({
		name: "dateRange",
		control: methods.control,
	}) as DateRange | undefined;

	const create = async (formData: EventForm) => {
		setSubmitting(true);
		try {
			if (
				!formData.dateRange ||
				!formData.dateRange.from ||
				!formData.dateRange.to ||
				!formData.img
			)
				return;
			const payload = new FormData();
			payload.append("name", formData.name);
			payload.append("startDate", formData.dateRange.from.toISOString());
			payload.append("endDate", formData.dateRange.to.toISOString());
			payload.append("img", formData.img[0]);

			await axios.post(`${import.meta.env.VITE_BACKEND_API}/events`, payload, {
				withCredentials: true,
			});

			setOpen(false);
			mutate("events");
			reset();
		} catch (e) {
			console.error(e);
		}
		setSubmitting(false);
	};

	const update = async (formData: EventForm) => {
		console.log("Update");
		setSubmitting(true);
		try {
			if (
				!formData.dateRange ||
				!formData.dateRange.from ||
				!formData.dateRange.to
			)
				return;
			const payload = new FormData();
			payload.append("name", formData.name);
			payload.append("startDate", formData.dateRange.from.toISOString());
			payload.append("endDate", formData.dateRange.to.toISOString());
			if (formData.img) payload.append("img", formData.img[0]);

			await axios.patch(
				`${import.meta.env.VITE_BACKEND_API}/events/${id}`,
				payload,
				{
					withCredentials: true,
				},
			);

			setOpen(false);
			mutate("events");
			mutate(`event-${id}`);
			setEventId(null);
			reset();
		} catch (e) {
			console.error(e);
		}
		setSubmitting(false);
	};

	useImperativeHandle(
		stateRef,
		() => ({
			setOpen,
			setEventId,
		}),
		[],
	);

	return (
		<FormProvider {...methods}>
			<Dialog
				open={open}
				onOpenChange={(val) => {
					setOpen(val);
					if (!val) setEventId(null);
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
							className="gap-5 flex-col flex"
							onSubmit={handleSubmit(id === null ? create : update)}
						>
							<div className="grid grid-cols-2 gap-5">
								<div className="col-span-full flex flex-col gap-2.5">
									<Label>Name</Label>
									<Input
										{...register("name", { required: true })}
										className="bg-mantle border-overlay-0 focus-visible:ring-overlay-0 focus-visible:outline-0 text-text"
										autoComplete="off"
									/>
								</div>
								<div className="flex flex-col gap-2.5">
									<Label>Event Period</Label>
									<Calendar
										selected={date}
										required={true}
										onSelect={(selected) => setValue("dateRange", selected)}
										mode="range"
										className="rounded-xl bg-mantle border-surface-1 border w-full"
									/>
								</div>
								<div className="flex flex-col gap-2.5">
									<Label>Image</Label>
									<Input
										{...register("img", { required: id === null })}
										type="file"
										className="bg-mantle border-overlay-0 focus-visible:ring-overlay-0 focus-visible:outline-0 text-text file:text-subtext-0 cursor-pointer"
										autoComplete="off"
									/>
									<PreviewImage
										url={data?.img}
										ref={ref}
										cropper={false}
										className="h-full"
									/>
								</div>
								<div className="flex flex-col gap-2.5 col-span-full">
									<Label>Participants</Label>
									<ProducerMenu />
								</div>
							</div>
							<Button
								type="submit"
								className="w-full bg-text text-crust hover:bg-crust hover:text-text"
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
