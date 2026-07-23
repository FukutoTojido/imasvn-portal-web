import { RiDeleteBinLine } from "@remixicon/react";
import { Loader2 } from "lucide-react";
import { DateTime } from "luxon";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router";
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
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { cn } from "~/lib/utils";
import {
	type LiveEventDto,
	useDeleteLive,
	useUpdateLive,
} from "~/services/live.services";

export default function UpdateEvent({ data }: { data?: LiveEventDto }) {
	const navigate = useNavigate();
	const { register, handleSubmit, reset, control } =
		useForm<Omit<LiveEventDto, "slug">>();
	const { mutateAsync, isPending } = useUpdateLive(data?.slug);
	const deleteLive = useDeleteLive(data?.slug);

	const thumbnail = useWatch<Omit<LiveEventDto, "slug">>({
		name: "thumbnail",
		control,
	});

	useEffect(() => {
		if (!data) {
			reset();
			return;
		}

		const { slug, ...rest } = data;
		reset(rest);
	}, [data, reset]);

	const submit = async (formData: Omit<LiveEventDto, "slug">) => {
		try {
			await mutateAsync({ ...formData, public: Boolean(formData.public) });
			toast.info("Update event successfully");
		} catch (e) {
			console.error(e);
			toast.error("Cannot update event");
		}
	};

	return (
		<form
			onSubmit={handleSubmit(submit)}
			className="md:flex-1 md:w-auto w-full"
		>
			<Card className="w-full">
				<CardHeader className="flex">
					<div className="flex-1">
						<CardTitle>Edit Event</CardTitle>
						<CardDescription>{data?.name}</CardDescription>
					</div>
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button variant={"destructive"}>
								<RiDeleteBinLine />
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Are you sure?</AlertDialogTitle>
								<AlertDialogDescription>
									This action cannot be undone. This will permanently delete the
									event record and all of the archives belong to it.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel disabled={deleteLive.isPending}>
									Cancel
								</AlertDialogCancel>
								<AlertDialogAction
									variant={"destructive"}
									disabled={deleteLive.isPending}
									onClick={async () => {
										try {
											await deleteLive.mutateAsync();
											navigate("/admin/live");
										} catch (e) {
											console.error(e);
											toast.error("Cannot delete Live");
										}
									}}
								>
									{deleteLive.isPending && <Loader2 className="animate-spin" />}
									Confirm
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</CardHeader>
				<CardContent className="grid grid-cols-2 gap-4">
					<Field className="col-span-full">
						<Label>Event Name</Label>
						<Input placeholder="Event Name" {...register("name")} />
					</Field>
					<Field>
						<Label>IP Slug</Label>
						<Input placeholder="IP Slug" {...register("ip_slug")} />
					</Field>
					<Field>
						<Label>Event Slug</Label>
						<Input placeholder="Event Slug" {...register("event_slug")} />
					</Field>
					<Field className="col-span-full md:col-span-1">
						<Label>Thumbnail</Label>
						<Input placeholder="Thumbnail" {...register("thumbnail")} />
					</Field>
					<Field className="md:col-span-1 col-span-full">
						<Label>Event Date</Label>
						<Controller<Omit<LiveEventDto, "slug">>
							name="date"
							control={control}
							render={({ field: { onChange, value } }) => (
								<DatePicker
									date={
										typeof value === "string"
											? DateTime.fromISO(value as string).toJSDate()
											: ((value as unknown as Date) ?? undefined)
									}
									setDate={onChange}
								/>
							)}
						/>
					</Field>
					<Field className="col-span-full flex-row">
						<Label>Public</Label>
						<Controller<Omit<LiveEventDto, "slug">>
							control={control}
							name="public"
							render={({ field: { value, onChange } }) => (
								<Switch onCheckedChange={onChange} checked={Boolean(value)} />
							)}
						/>
					</Field>
					<div
						style={{
							backgroundImage: `url(${thumbnail})`,
						}}
						className={cn(
							"col-span-full aspect-video bg-cover rounded-lg bg-secondary",
							"border-2 border-dashed",
						)}
					/>
				</CardContent>
				<CardFooter>
					<Button className="w-full" type="submit" disabled={isPending}>
						{isPending && <Loader2 className="animate-spin" />}
						Update
					</Button>
				</CardFooter>
			</Card>
		</form>
	);
}
