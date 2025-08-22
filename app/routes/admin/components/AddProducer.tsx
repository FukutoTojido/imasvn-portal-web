import { DialogTitle } from "@radix-ui/react-dialog";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { KeyedMutator } from "swr";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
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
				<Button className="bg-text text-crust hover:bg-base hover:text-text self-end font-normal">
					Add Producer
				</Button>
			</DialogTrigger>
			<DialogContent
				className="bg-base border-surface-1"
				aria-describedby={undefined}
				onOpenAutoFocus={(e) => e.preventDefault()}
			>
				<DialogTitle className="text-text">Add Producer</DialogTitle>
				<form
					onSubmit={handleSubmit(addProducer)}
					className="flex flex-col gap-2.5"
				>
					<Label className="text-text">Name</Label>
					<Input
						{...register("name", { required: true})}
						className="bg-base border-overlay-0 focus-visible:ring-overlay-0 focus-visible:outline-0 text-text"
						autoComplete="off"
						autoFocus={true}
					/>
					<Button
						type="submit"
						className="bg-text text-crust hover:bg-crust hover:text-text"
						disabled={isLoading}
					>
						{isLoading ? <Loader2 className="animate-spin" /> : ""}
						Add
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
