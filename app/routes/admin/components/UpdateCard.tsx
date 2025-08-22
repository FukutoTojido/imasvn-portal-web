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
import { FormProvider, useForm } from "react-hook-form";
import useSWR, { type KeyedMutator } from "swr";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { Card, Producer } from "../types";
import PreviewImage from "./PreviewImage";

type FormType = {
	name: string;
	idol: string;
	title: string;
	img?: FileList | null;
};

export default function UpdateCard({
	ref,
	id,
	name,
	mutate,
}: {
	ref: RefObject<{
		setOpen: Dispatch<SetStateAction<boolean>>;
		setCardId: Dispatch<SetStateAction<string | null>>;
	} | null>;
	id: string;
	name: string;
	mutate: KeyedMutator<{
		producerData: Producer;
		cards: Card[];
	} | null>;
}) {
	const [open, setOpen] = useState(false);
	const [cardId, setCardId] = useState<string | null>(null);

	const { data, isLoading } = useSWR(
		cardId ? `card-${cardId}` : null,
		async () => {
			try {
				const { data: cards } = await axios.get<Card>(
					`${import.meta.env.VITE_BACKEND_API}/producer-id/${id}/cards/${cardId}`,
				);
				return cards;
			} catch (e) {
				console.error(e);
				return null;
			}
		},
	);

	const methods = useForm<FormType>({
		defaultValues: {
			name: "",
			idol: "",
			title: "",
			img: null,
		},
		values: {
			name: data?.name ?? name ?? "",
			idol: data?.idol ?? "",
			title: data?.title ?? "",
			img: null,
		},
	});

	const { register, handleSubmit, reset } = methods;

	const [submitting, setSubmitting] = useState(false);
	const getImageRef = useRef<{ getImage: () => Promise<File | null> }>(null);

	useImperativeHandle(
		ref,
		() => ({
			setOpen,
			setCardId,
		}),
		[],
	);

	const update = async (formData: FormType) => {
		setSubmitting(true);
		try {
			const payload = new FormData();
			if (formData.name) payload.append("name", formData.name);
			payload.append("idol", formData.idol);
			payload.append("title", formData.title);
			if (formData.img) {
				const file = await getImageRef.current?.getImage();
				if (file) {
					payload.append("img", file);
				}
			}

			await axios.patch(
				`${import.meta.env.VITE_BACKEND_API}/producer-id/${id}/cards/${cardId}`,
				payload,
				{
					withCredentials: true,
				},
			);

			setOpen(false);
			mutate();
			reset();
			setCardId(null);
		} catch (e) {
			console.error(e);
		}
		setSubmitting(false);
	};

	const create = async (formData: FormType) => {
		setSubmitting(true);
		try {
			const payload = new FormData();
			payload.append("name", formData.name);
			payload.append("idol", formData.idol);
			payload.append("title", formData.title);
			if (formData.img) {
				const file = await getImageRef.current?.getImage();
				if (file) {
					payload.append("img", file);
				}
			}

			await axios.post(
				`${import.meta.env.VITE_BACKEND_API}/producer-id/${id}/cards`,
				payload,
				{
					withCredentials: true,
				},
			);

			setOpen(false);
			mutate();
			reset();
			setCardId(null);
		} catch (e) {
			console.error(e);
		}
		setSubmitting(false);
	};

	return (
		<FormProvider {...methods}>
			<Dialog
				open={open}
				onOpenChange={(open) => {
					setOpen(open);
					if (!open) setCardId(null);
				}}
			>
				<DialogTrigger className="w-max" asChild>
					<Button className="bg-text text-crust hover:bg-base hover:text-text self-end font-normal">
						Insert Card
					</Button>
				</DialogTrigger>
				<DialogContent
					aria-describedby={undefined}
					className="bg-base border-surface-1 text-text sm:max-w-full w-[600px]"
					onOpenAutoFocus={(e) => e.preventDefault()}
				>
					<DialogTitle className="font-medium">
						{cardId ? "Update card" : "Add card"}
					</DialogTitle>
					{isLoading ? (
						<Loader2 className="animate-spin" />
					) : (
						<form
							className="w-full grid grid-cols-2 gap-5"
							onSubmit={handleSubmit(cardId === null ? create : update)}
						>
							<div className="flex flex-col gap-2.5">
								<Label>Name</Label>
								<Input
									{...register("name", { required: true })}
									className="bg-mantle border-overlay-0 focus-visible:ring-overlay-0 focus-visible:outline-0 text-text"
									autoComplete="off"
								/>
							</div>
							<div className="flex flex-col gap-2.5">
								<Label>Image</Label>
								<Input
									type="file"
									{...register("img", { required: cardId === null })}
									className="bg-mantle border-overlay-0 focus-visible:ring-overlay-0 focus-visible:outline-0 text-text file:text-subtext-0 cursor-pointer"
									autoComplete="off"
								/>
							</div>
							<div className="flex flex-col gap-2.5">
								<Label>Idol name</Label>
								<Input
									{...register("idol", { required: true })}
									className="bg-mantle border-overlay-0 focus-visible:ring-overlay-0 focus-visible:outline-0 text-text"
									autoComplete="off"
								/>
							</div>
							<div className="flex flex-col gap-2.5">
								<Label>Title</Label>
								<Input
									{...register("title", { required: true })}
									className="bg-mantle border-overlay-0 focus-visible:ring-overlay-0 focus-visible:outline-0 text-text"
									autoComplete="off"
								/>
							</div>
							<PreviewImage url={data?.img} ref={getImageRef} />
							<div className="col-span-full">
								<Button
									type="submit"
									className="w-full bg-text text-crust hover:bg-crust hover:text-text"
									disabled={submitting}
								>
									{submitting ? <Loader2 className="animate-spin" /> : ""}
									{cardId === null ? "Create" : "Update"}
								</Button>
							</div>
						</form>
					)}
				</DialogContent>
			</Dialog>
		</FormProvider>
	);
}
