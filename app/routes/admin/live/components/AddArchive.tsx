import { Loader2 } from "lucide-react";
import { DateTime } from "luxon";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { DatePicker } from "~/components/ui/date-picker";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Field, FieldGroup } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { type LiveArchiveDto, useAddArchive } from "~/services/live.services";

export default function AddArchive({ slug }: { slug?: string }) {
	const [open, setOpen] = useState(false);
	const { handleSubmit, register, control, reset } =
		useForm<Omit<LiveArchiveDto, "event_id" | "id">>();
	const { mutateAsync, isPending } = useAddArchive(slug);

	const submit = async (formData: Omit<LiveArchiveDto, "event_id" | "id">) => {
		try {
			await mutateAsync(formData);
			toast.info("Created archive");
			setOpen(false);
			reset();
		} catch (e) {
			console.error(e);
			toast.info("Cannot create archive");
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="w-full">Add Archive</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Archive</DialogTitle>
					<DialogDescription hidden></DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit(submit)} id="create-archive">
					<FieldGroup>
						<Field>
							<Label>Broadcast Slug</Label>
							<Input
								placeholder="Broadcast Slug"
								{...register("broadcast_slug", { required: true })}
							/>
						</Field>
						<Field>
							<Label>Broadcast Name</Label>
							<Input
								placeholder="Broadcast Name"
								{...register("broadcast_name", { required: true })}
							/>
						</Field>
						<Field>
							<Label>Broadcast Date</Label>
							<Controller<Omit<LiveArchiveDto, "id" | "event_id">>
								control={control}
								name="broadcast_date"
								render={({ field: { value, onChange } }) => (
									<DatePicker
										date={
											typeof value === "string"
												? DateTime.fromISO(value).toJSDate()
												: (value ?? undefined)
										}
										setDate={onChange}
									/>
								)}
							/>
						</Field>
					</FieldGroup>
				</form>
				<DialogFooter>
					<Button className="flex-1" type="submit" form="create-archive">
						{isPending && <Loader2 className="animate-spin" />}
						Add Archive
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
