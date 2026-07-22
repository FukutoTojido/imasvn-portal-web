import { Loader2 } from "lucide-react";
import { type ComponentProps, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
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
import { useAddLive, useImportLive } from "~/services/live.services";

export default function AddEvent(props: ComponentProps<typeof Button>) {
	const [open, setOpen] = useState(false);

	const importForm = useForm<{ slug: string }>();
	const createForm = useForm<{ slug: string; name: string }>();

	const importer = useImportLive();
	const importing = async ({ slug }: { slug: string }) => {
		try {
			await importer.mutateAsync({ slug });
			toast.info("Import Live completed");
			setOpen(false);
		} catch (e) {
			console.error(e);
			toast.error("Cannot import Live");
		}
	};

	const creator = useAddLive();
	const create = async ({ slug, name }: { slug: string; name: string }) => {
		try {
			await creator.mutateAsync({ slug, name });
			toast.info("Created Live");
			setOpen(false);
		} catch (e) {
			console.error(e);
			toast.error("Cannot create Live");
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button {...props}>Add Event</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-full w-150">
				<DialogHeader>
					<DialogTitle>Add Event</DialogTitle>
					<DialogDescription>
						Import from slug or create one manually
					</DialogDescription>
				</DialogHeader>
				<form className="w-full" onSubmit={importForm.handleSubmit(importing)}>
					<FieldGroup>
						<Field>
							<Label>Import from slug</Label>
							<Input
								placeholder="You should know where to get the slug"
								{...importForm.register("slug", { required: true })}
							/>
						</Field>
						<Button
							className="w-full"
							type="submit"
							disabled={importer.isPending || creator.isPending}
						>
							{importer.isPending && <Loader2 className="animate-spin" />}
							Import
						</Button>
					</FieldGroup>
				</form>
				<Separator />
				<form className="w-full" onSubmit={createForm.handleSubmit(create)}>
					<FieldGroup>
						<Field>
							<Label>Slug</Label>
							<Input
								placeholder="Slug"
								{...createForm.register("slug", { required: true })}
							/>
						</Field>
						<Field>
							<Label>Event Name</Label>
							<Input
								placeholder="Event Name"
								{...createForm.register("name", { required: true })}
							/>
						</Field>
						<Button
							className="w-full"
							type="submit"
							disabled={importer.isPending || creator.isPending}
						>
							{creator.isPending && <Loader2 className="animate-spin" />}
							Create Event
						</Button>
					</FieldGroup>
				</form>
			</DialogContent>
		</Dialog>
	);
}
