import { RiAddLine } from "@remixicon/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { Separator } from "~/components/ui/separator";
import { type LiveChannelDto, useAddChannel } from "~/services/live.services";

export default function AddChannel({
	slug,
	broadcast_id,
}: {
	slug?: string;
	broadcast_id?: number;
}) {
	const [open, setOpen] = useState(false);

	const { handleSubmit, register, reset } =
		useForm<Pick<LiveChannelDto, "channel_id" | "channel_name">>();
	const { mutateAsync, isPending } = useAddChannel(slug, broadcast_id);

	const submit = async (
		formData: Pick<LiveChannelDto, "channel_id" | "channel_name">,
	) => {
		try {
			await mutateAsync(formData);
			toast.info("Created channel");
			setOpen(false);
			reset();
		} catch (e) {
			console.error(e);
			toast.info("Cannot create channel");
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<RiAddLine />
				</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[calc(100%-2rem)] flex-col flex">
				<DialogHeader>
					<DialogTitle>Create Channel</DialogTitle>
					<DialogDescription hidden></DialogDescription>
				</DialogHeader>
				<Separator />
				<form
					id="create-channel"
					className="w-full grid grid-cols-2 gap-2 flex-1 overflow-y-auto overflow-x-clip no-scrollbar px-1"
					onSubmit={handleSubmit(submit)}
				>
					<Field className="w-full">
						<Label>Channel ID</Label>
						<Input
							placeholder="Channel ID"
							{...register("channel_id", { required: true })}
						/>
					</Field>
					<Field className="w-full">
						<Label>Channel Name</Label>
						<Input
							placeholder="Channel Name"
							{...register("channel_name", { required: true })}
						/>
					</Field>
				</form>
				<DialogFooter>
					<Button
						className="flex-1"
						type="submit"
						form="create-channel"
						disabled={isPending}
					>
						{isPending && <Loader2 className="animate-spin" />}
						Create Channel
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
