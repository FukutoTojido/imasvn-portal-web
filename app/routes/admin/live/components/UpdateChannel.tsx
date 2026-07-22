import { RiDeleteBin2Fill } from "@remixicon/react";
import { Loader2 } from "lucide-react";
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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Field } from "~/components/ui/field";
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
import { Separator } from "~/components/ui/separator";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import {
	type LiveChannelDto,
	useDeleteChannel,
	useGetChannel,
	useUpdateChannel,
} from "~/services/live.services";

const ChannelUpdateForm = ({
	slug,
	broadcast_id,
	id,
	setOpen,
}: {
	slug?: string;
	broadcast_id?: number;
	id?: number;
	setOpen?: (_: boolean) => void;
}) => {
	const { data, isLoading, error } = useGetChannel(slug, broadcast_id, id);
	const { mutateAsync, isPending } = useUpdateChannel(slug, broadcast_id, id);
	const deleteChannel = useDeleteChannel(slug, broadcast_id, id);

	const { register, handleSubmit, reset, control } =
		useForm<Omit<LiveChannelDto, "event_id" | "id" | "broadcast_id">>();

	useEffect(() => {
		if (!data) {
			reset();
			return;
		}

		const { id, event_id, broadcast_id, ...rest } = data;
		reset(rest);
	}, [data, reset]);

	const submit = async (
		formData: Omit<LiveChannelDto, "event_id" | "id" | "broadcast_id">,
	) => {
		try {
			await mutateAsync({ ...formData, archive: Boolean(formData.archive) });
			toast.info("Update event successfully");
		} catch (e) {
			console.error(e);
			toast.error("Cannot update event");
		}
	};

	return (
		<form onSubmit={handleSubmit(submit)} className="space-y-4">
			<div className="w-full grid grid-cols-2 gap-2">
				<Field className="w-full">
					<Label>Channel ID</Label>
					<Input placeholder="Channel ID" {...register("channel_id")} />
				</Field>
				<Field className="w-full">
					<Label>Channel Name</Label>
					<Input placeholder="Channel Name" {...register("channel_name")} />
				</Field>
				<Separator className="col-span-full my-2" />
				<Field>
					<Label>URL</Label>
					<Input placeholder="URL" {...register("url")} />
				</Field>
				<Field>
					<Label>Forward URL</Label>
					<Input placeholder="Forward URL" {...register("forward_url")} />
				</Field>
				<Separator className="col-span-full my-2" />
				<Field className="col-span-full">
					<Label>Stream Type</Label>
					<Controller<Omit<LiveChannelDto, "event_id" | "id" | "broadcast_id">>
						name="stream_type"
						control={control}
						render={({ field: { value, onChange } }) => (
							<Select
								defaultValue={data?.stream_type}
								value={value as string}
								onValueChange={(value) => onChange(value)}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Stream Type..." />
								</SelectTrigger>
								<SelectContent position="popper">
									<SelectGroup>
										<SelectItem value="hls">HLS</SelectItem>
										<SelectItem value="dash">DASH</SelectItem>
										<SelectItem value="whep">WHEP</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>
						)}
					/>
				</Field>
				<Separator className="col-span-full my-2" />
				<Field className="col-span-full">
					<Label>Cookies</Label>
					<Textarea
						rows={6}
						className="font-mono resize-none field-sizing-fixed"
						{...register("cookies")}
					/>
				</Field>
				<Field className="col-span-full">
					<Label>Headers</Label>
					<Textarea
						rows={6}
						className="font-mono resize-none field-sizing-fixed"
						{...register("headers")}
					/>
				</Field>
				<Separator className="col-span-full my-2" />
				<Field className="col-span-full flex-row">
					<Label>Archive</Label>
					<Controller<Omit<LiveChannelDto, "id" | "event_id" | "broadcast_id">>
						control={control}
						name="archive"
						render={({ field: { value, onChange } }) => (
							<Switch onCheckedChange={onChange} checked={Boolean(value)} />
						)}
					/>
				</Field>
			</div>
			<DialogFooter>
				<Button className="md:flex-1" type="submit">
					{isPending && <Loader2 className="animate-spin" />}
					Update Channel
				</Button>
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button variant={"destructive"} type="button">
							<RiDeleteBin2Fill />
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Are you sure?</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone. This will delete the streaming
								channel.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel disabled={deleteChannel.isPending}>
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction
								variant={"destructive"}
								disabled={deleteChannel.isPending}
								onClick={async () => {
									try {
										await deleteChannel.mutateAsync();
										setOpen?.(false);
									} catch (e) {
										console.error(e);
										toast.error("Cannot delete channel");
									}
								}}
							>
								{isPending && <Loader2 className="animate-spin" />}
								Confirm
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</DialogFooter>
		</form>
	);
};

export default function UpdateChannel({ data }: { data: LiveChannelDto }) {
	const [open, setOpen] = useState(false);
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">{data?.channel_name}</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[calc(100%-2rem)] overflow-auto">
				<DialogHeader>
					<DialogTitle>{data?.channel_name}</DialogTitle>
					<DialogDescription hidden></DialogDescription>
				</DialogHeader>
				<Separator />
				<ChannelUpdateForm
					slug={data.event_id}
					broadcast_id={data.broadcast_id}
					id={data.id}
				/>
			</DialogContent>
		</Dialog>
	);
}
