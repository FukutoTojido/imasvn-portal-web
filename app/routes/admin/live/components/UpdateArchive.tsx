import {
	RiArrowRightSLine,
	RiDeleteBin2Fill,
	RiResetLeftLine,
} from "@remixicon/react";
import { Loader2 } from "lucide-react";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { DatePicker } from "~/components/ui/date-picker";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Field, FieldGroup } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Switch } from "~/components/ui/switch";
import {
	type LiveArchiveDto,
	type LiveEventDto,
	useDeleteArchive,
	useGetArchive,
	useGetArchives,
	useRefreshArchive,
	useUpdateArchive,
} from "~/services/live.services";
import AddArchive from "./AddArchive";
import Channels from "./Channels";

const ArchiveUpdateForm = ({
	slug,
	broadcast_id,
	setOpen,
}: {
	slug: string;
	broadcast_id: number;
	setOpen?: (_: boolean) => void;
}) => {
	const { data, isLoading, error } = useGetArchive(slug, broadcast_id);
	const { mutateAsync, isPending } = useUpdateArchive(slug, broadcast_id);
	const deleteArchive = useDeleteArchive(slug, broadcast_id);
	const refreshArchive = useRefreshArchive(slug, broadcast_id);

	const { register, handleSubmit, reset, control } =
		useForm<Omit<LiveArchiveDto, "event_id" | "id">>();

	useEffect(() => {
		if (!data) {
			reset();
			return;
		}

		const { event_id, id, ...rest } = data;
		reset(rest);
	}, [data, reset]);

	const submit = async (formData: Omit<LiveArchiveDto, "id" | "event_id">) => {
		try {
			await mutateAsync({ ...formData, public: Boolean(formData.public) });
			toast.info("Update event successfully");
		} catch (e) {
			console.error(e);
			toast.error("Cannot update event");
		}
	};

	const submitting =
		isPending || refreshArchive.isPending || deleteArchive.isPending;

	return (
		<form className="space-y-4" onSubmit={handleSubmit(submit)}>
			<FieldGroup>
				<Field>
					<Label>Broadcast Slug</Label>
					<Input placeholder="Broadcast Slug" {...register("broadcast_slug")} />
				</Field>
				<Field>
					<Label>Broadcast Name</Label>
					<Input placeholder="Broadcast Name" {...register("broadcast_name")} />
				</Field>
				<Field>
					<Label>Broadcast Date</Label>
					<Controller<Omit<LiveArchiveDto, "id" | "event_id">>
						name="broadcast_date"
						control={control}
						render={({ field: { onChange, value } }) => (
							<DatePicker
								date={
									typeof value === "string"
										? DateTime.fromISO(value as string).toJSDate()
										: (value ?? undefined)
								}
								setDate={onChange}
							/>
						)}
					/>
				</Field>
				<Field className="col-span-full flex-row">
					<Label>Public</Label>
					<Controller<Omit<LiveArchiveDto, "event_id" | "id">>
						control={control}
						name="public"
						render={({ field: { value, onChange } }) => (
							<Switch onCheckedChange={onChange} checked={Boolean(value)} />
						)}
					/>
				</Field>
			</FieldGroup>
			<div className="w-full flex gap-2">
				<Button
					type="button"
					disabled={submitting}
					onClick={async () => {
						try {
							await refreshArchive.mutateAsync();
							toast.info("Refresh archive info completed!");
						} catch (e) {
							console.error(e);
							toast.error("Cannot refresh archive");
						}
					}}
				>
					{refreshArchive.isPending ? (
						<Loader2 className="animate-spin" />
					) : (
						<RiResetLeftLine />
					)}
				</Button>
				<Button className="flex-1" type="submit" disabled={submitting}>
					{isPending && <Loader2 className="animate-spin" />}
					Update Archive
				</Button>
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button variant={"destructive"} disabled={submitting} type="button">
							{deleteArchive.isPending ? (
								<Loader2 className="animate-spin" />
							) : (
								<RiDeleteBin2Fill />
							)}
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Are you sure?</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone. This will delete the archive and
								all the channels belong to it.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel disabled={deleteArchive.isPending}>
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction
								variant={"destructive"}
								disabled={deleteArchive.isPending}
								onClick={async () => {
									try {
										await deleteArchive.mutateAsync();
										setOpen?.(false);
									} catch (e) {
										console.error(e);
										toast.error("Cannot delete archive");
									}
								}}
							>
								{deleteArchive.isPending && (
									<Loader2 className="animate-spin" />
								)}
								Confirm
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</form>
	);
};

const ArchivePopup = ({ data }: { data: LiveArchiveDto }) => {
	const [open, setOpen] = useState(false);
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant={"outline"}
					className="w-full py-2 px-3 flex items-center h-max text-left"
				>
					<div className="flex-1 w-full">
						<div className="font-bold">{data.broadcast_name}</div>
						<div className="text-sm">
							{data.broadcast_date
								? DateTime.fromISO(data.broadcast_date).toFormat("LLL dd, yyyy")
								: ""}
						</div>
					</div>
					<RiArrowRightSLine className="size-8" />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Archive</DialogTitle>
					<DialogDescription hidden></DialogDescription>
				</DialogHeader>
				<ArchiveUpdateForm
					slug={data.event_id}
					broadcast_id={data.id as number}
					setOpen={setOpen}
				/>
				<Separator />
				<Field>
					<Label>Channels</Label>
					<Channels slug={data.event_id} broadcast_id={data.id} />
				</Field>
			</DialogContent>
		</Dialog>
	);
};

export default function UpdateArchive({
	data: event,
}: {
	data?: LiveEventDto;
}) {
	const { data, isLoading, error } = useGetArchives(event?.slug);

	return (
		<Card className="md:flex-1 w-full md:w-auto">
			<CardHeader className="flex items-center">
				<CardTitle>Archives</CardTitle>
				<CardDescription>List of archives for this event</CardDescription>
			</CardHeader>
			<CardContent className="space-y-2">
				{(error || data?.length === 0) && (
					<div className="w-full py-20 text-center">No Result</div>
				)}
				{isLoading && (
					<div className="w-full py-20 text-center">
						<Loader2 className="animate-spin mx-auto text-4xl" />
					</div>
				)}
				{data?.map((archive) => (
					<ArchivePopup data={archive} key={archive.id} />
				))}
			</CardContent>
			<CardFooter>
				<AddArchive slug={event?.slug} />
			</CardFooter>
		</Card>
	);
}
