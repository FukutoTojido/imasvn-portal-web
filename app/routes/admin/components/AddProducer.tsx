import axios from "axios";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { KeyedMutator } from "swr";
import { Button } from "~/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { Producer } from "../types";

export default function AddProducer({
	mutate,
}: {
	mutate?: KeyedMutator<Producer[]>;
}) {
	const [open, setOpen] = useState(false);
	const { register, handleSubmit, reset } = useForm({
		defaultValues: {
			name: "",
		},
	});
	const [isLoading, setLoading] = useState(false);

	const addProducer = async (formData: { name: string }) => {
		setLoading(true);
		try {
			await axios.post(
				`${import.meta.env.VITE_BACKEND_API}/producer-id`,
				{
					name: formData.name,
				},
				{
					withCredentials: true,
				},
			);
			setOpen(false);
			reset();
			mutate?.();
			setLoading(false);
		} catch (e) {
			console.error(e);
		}
		setLoading(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger className="w-max" asChild>
				<Button>Add Producer</Button>
			</DialogTrigger>
			<DialogContent
				aria-describedby={undefined}
				onOpenAutoFocus={(e) => e.preventDefault()}
			>
				<DialogHeader>
					<DialogTitle>Add Producer</DialogTitle>
				</DialogHeader>
				<form
					onSubmit={handleSubmit(addProducer)}
					className="flex flex-col gap-2.5"
				>
					<Label>Name</Label>
					<Input
						{...register("name", { required: true })}
						autoComplete="off"
						autoFocus={true}
					/>
					<Button type="submit" disabled={isLoading}>
						{isLoading ? <Loader2 className="animate-spin" /> : ""}
						Add
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
