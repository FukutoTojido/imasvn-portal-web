import axios from "axios";
import * as htmlToImage from "html-to-image";
import { Copy, Loader2 } from "lucide-react";
import QRCode from "qrcode";
import {
	useCallback,
	useEffect,
	useRef,
	useState,
	type RefObject,
} from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
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
import PreviewImage from "../components/PreviewImage";
import { getEvents } from "../events";
import type { Route } from "./+types/page";
import BackCard from "./components/BackCard";
import FrontCard from "./components/FrontCard";
import "./style.css";

type FormType = {
	name: string;
	idol: string;
	idolJapanese: string;
	title: string;
	event: string;
	img?: FileList | null;
	frontImg?: FileList | null;
	backImg?: FileList | null;
	config?: {
		x?: number;
		y?: number;
		scale?: number;
	};
};
import { toast } from "sonner";
import { Slider } from "~/components/ui/slider";

export const loader = async ({ params: { id } }: Route.LoaderArgs) => {
	try {
		const { data: cardData } = await axios.get(
			`${import.meta.env.VITE_BACKEND_API}/producer-id/_/cards/${id}`,
		);
		const { data: userData } = await axios.get(
			`${import.meta.env.VITE_BACKEND_API}/producer-id/${cardData.pid}`,
		);
		const events = await getEvents();

		return {
			cardData,
			userData,
			events,
		};
	} catch (e) {
		console.error(e);
		return null;
	}
};

const safeJSONParse = (str: string) => {
	if (!str) return null;

	try {
		return JSON.parse(str);
	} catch (e) {
		console.error(e);
		return null;
	}
};

export default function Page({ loaderData }: Route.ComponentProps) {
	const config = safeJSONParse(loaderData?.cardData.config);
	const frontRef = useRef<HTMLDivElement>(null);
	const backRef = useRef<HTMLDivElement>(null);
	const ref = useRef<HTMLDivElement>(null);
	const getImageRef = useRef<{ getImage: () => Promise<File | null> }>(null);

	const methods = useForm<FormType>({
		defaultValues: {
			name: "",
			idol: "",
			idolJapanese: "",
			title: "",
			img: null,
			frontImg: null,
			backImg: null,
			config: {
				x: config?.x ? +config?.x : 0,
				y: config?.y ? +config?.y : 0,
				scale: config?.scale ? +config?.scale : 100,
			},
		},
		values: {
			name: loaderData?.cardData.name ?? loaderData?.userData.name ?? "",
			idol: loaderData?.cardData.idol ?? "",
			idolJapanese: loaderData?.cardData.idolJapanese ?? "",
			event: loaderData?.cardData.event ?? "",
			title: loaderData?.cardData.title ?? "",
			img: null,
			frontImg: null,
			backImg: null,
			config: {
				x: config?.x ? +config?.x : 0,
				y: config?.y ? +config?.y : 0,
				scale: config?.scale ? +config?.scale : 100,
			},
		},
	});
	const { register, setValue, handleSubmit, watch } = methods;
	const x = watch("config.x");
	const y = watch("config.y");
	const imgScale = watch("config.scale");

	const copyImage = useCallback(
		async (ref: RefObject<HTMLDivElement | null>) => {
			if (!ref.current) return;

			try {
				const blob = await htmlToImage.toBlob(ref.current, {
					cacheBust: true,
				});
				if (!blob) return;

				await navigator.clipboard.write([
					new ClipboardItem({
						"image/png": blob,
					}),
				]);
				toast("Copied card image!");
			} catch (e) {
				console.error(e);
				toast.error("Error copying card image!");
			}
		},
		[],
	);

	const [submitting, setSubmitting] = useState(false);
	const [copyingFront, setCopyingFront] = useState(false);
	const [copyingBack, setCopyingBack] = useState(false);

	const [qrCode, setQrCode] = useState<string>();
	const [scale, setScale] = useState(100);

	useEffect(() => {
		const getQr = async () => {
			const qr = await QRCode.toDataURL(
				`${import.meta.env.VITE_BASE_URL}/producer-id/${loaderData?.cardData.id}`,
				{
					type: "image/webp",
					color: {
						light: "#ffffff00",
						dark: "#ffffffff",
					},
					margin: 0,
					width: 325,
				},
			);

			setQrCode(qr);
		};

		getQr();
	}, [loaderData?.cardData.id]);

	useEffect(() => {
		if (!ref.current) return;
		const resizeObserver = new ResizeObserver((entries) => {
			const [ele] = entries;
			if (!ele) return;

			const width = ele.contentRect.width;
			setScale((width / 2360) * 100);
		});

		resizeObserver.observe(ref.current);

		return () => resizeObserver.disconnect();
	}, []);

	const update = async (formData: FormType) => {
		setSubmitting(true);
		try {
			const payload = new FormData();
			if (formData.name) payload.append("name", formData.name);
			if (formData.idol) payload.append("idol", formData.idol);
			if (formData.idolJapanese)
				payload.append("idolJapanese", formData.idolJapanese);
			if (formData.title) payload.append("title", formData.title);
			if (formData.event) payload.append("event", formData.event);

			if (formData.img) {
				const file = await getImageRef.current?.getImage();
				if (file) {
					payload.append("img", file);
				}
			}

			if (formData.frontImg) {
				payload.append("frontImg", formData.frontImg[0]);
			}

			if (formData.backImg) {
				payload.append("backImg", formData.backImg[0]);
			}

			if (formData.config) {
				payload.append("config", JSON.stringify({
				x: formData.config?.x?.toString() ?? "0",
				y: formData.config?.y?.toString() ?? "0",
				scale: formData.config?.scale?.toString() ?? "100" ,
			}));
			}

			await axios.patch(
				`${import.meta.env.VITE_BACKEND_API}/producer-id/${loaderData?.userData.id}/cards/${loaderData?.cardData.id}`,
				payload,
				{
					withCredentials: true,
				},
			);
			toast("Save completed!");
		} catch (e) {
			console.error(e);
			toast.error("Save failed!");
		}
		setSubmitting(false);
	};

	return (
		<FormProvider {...methods}>
			<div className="w-full h-full flex md:flex-row gap-5 flex-col-reverse">
				<form
					onSubmit={handleSubmit(update)}
					className="max-w-full md:w-[500px] w-full h-full bg-base rounded-xl border border-surface-1 p-5 grid grid-cols-2 gap-5"
				>
					<div className="flex flex-col gap-2.5">
						<Label>Producer Name</Label>
						<Input
							{...register("name", { required: true })}
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

					<div className="flex flex-1 flex-col gap-2.5">
						<Label>Idol Name</Label>
						<Input
							{...register("idol", { required: true })}
							className="bg-mantle border-overlay-0 focus-visible:ring-overlay-0 focus-visible:outline-0 text-text"
							autoComplete="off"
						/>
					</div>
					<div className="flex flex-1 flex-col gap-2.5">
						<Label>Idol Name (Japanese)</Label>
						<Input
							{...register("idolJapanese", { required: true })}
							className="bg-mantle border-overlay-0 focus-visible:ring-overlay-0 focus-visible:outline-0 text-text"
							autoComplete="off"
						/>
					</div>
					<div className="flex flex-col gap-2.5">
						<Label>Event</Label>
						<Select
							defaultValue={loaderData?.cardData.event?.toString()}
							onValueChange={async (value) => {
								setValue("event", value);
							}}
						>
							<SelectTrigger className="bg-mantle border-surface-1 w-full focus-visible:ring-overlay-0 ">
								<SelectValue
									placeholder="Event..."
									className="placeholder:text-subtext-0"
								/>
							</SelectTrigger>
							<SelectContent className="bg-mantle border border-surface-1 text-text">
								<SelectGroup>
									{(loaderData?.events ?? []).map((event) => (
										<SelectItem
											key={event.id}
											value={event.id.toString()}
											className="data-[highlighted]:bg-surface-0 data-[highlighted]:text-text text-wrap"
										>
											{event.name}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
					<div className="flex flex-col gap-2.5">
						<Label>Back Image</Label>
						<Input
							{...register("backImg")}
							type="file"
							className="bg-mantle border-overlay-0 focus-visible:ring-overlay-0 focus-visible:outline-0 text-text file:text-subtext-0 cursor-pointer"
							autoComplete="off"
						/>
					</div>
					<div className="flex flex-col gap-2.5 col-span-full">
						<Label>Front Image</Label>
						<Input
							{...register("frontImg")}
							type="file"
							className="bg-mantle border-overlay-0 focus-visible:ring-overlay-0 focus-visible:outline-0 text-text file:text-subtext-0 cursor-pointer"
							autoComplete="off"
						/>
					</div>
					<div className="flex flex-col gap-2.5">
						<Label>Position X</Label>
						<div className="flex gap-5">
							<Slider {...register("config.x")} defaultValue={[config?.x ? +config?.x : 0]} max={100} min={-100} step={1} />
							<span className="w-20 text-center">{x}%</span>
						</div>
					</div>
					<div className="flex flex-col gap-2.5">
						<Label>Position Y</Label>
						<div className="flex gap-5">
							<Slider {...register("config.y")} defaultValue={[config?.y ? +config?.y : 0]} max={100} min={-100} step={1} />
							<span className="w-20 text-center">{y}%</span>
						</div>
					</div>
					<div className="flex flex-col gap-2.5 col-span-full">
						<Label>Scale</Label>
						<div className="flex gap-5">
							<Slider
								{...register("config.scale")}
								defaultValue={[config?.scale ? +config?.scale : 100]}
								max={200}
								min={50}
								step={1}
							/>
							<span className="w-20 text-center">{imgScale}%</span>
						</div>
					</div>
					<div className="flex flex-col gap-2.5">
						<Label>ID Image</Label>
						<Input
							{...register("img")}
							type="file"
							className="bg-mantle border-overlay-0 focus-visible:ring-overlay-0 focus-visible:outline-0 text-text file:text-subtext-0 cursor-pointer"
							autoComplete="off"
						/>
					</div>
					<div className="flex flex-col gap-2.5">
						<Label>Actions</Label>
						<div className="flex gap-2.5">
							<Button
								type="submit"
								className="flex-1 bg-text text-crust hover:bg-crust hover:text-text"
								disabled={copyingFront}
								onClick={async () => {
									setCopyingFront(true);
									await copyImage(frontRef);
									setCopyingFront(false);
								}}
							>
								{copyingFront ? <Loader2 className="animate-spin" /> : <Copy />}
								Front
							</Button>
							<Button
								type="submit"
								className="flex-1 bg-text text-crust hover:bg-crust hover:text-text"
								disabled={copyingBack}
								onClick={async () => {
									setCopyingBack(true);
									await copyImage(backRef);
									setCopyingBack(false);
								}}
							>
								{copyingBack ? <Loader2 className="animate-spin" /> : <Copy />}
								Back
							</Button>
						</div>
					</div>
					<PreviewImage url={loaderData?.cardData.img} ref={getImageRef} />
					<div className="col-span-full">
						<Button
							type="submit"
							className="w-full bg-text text-crust hover:bg-crust hover:text-text"
							disabled={submitting}
						>
							{submitting ? <Loader2 className="animate-spin" /> : ""}
							Save
						</Button>
					</div>
				</form>
				<div
					className="relative h-full overflow-hidden flex flex-col items-center gap-5 text-white md:flex-1 md:w-auto w-full flex-initial"
					ref={ref}
				>
					<FrontCard
						ref={frontRef}
						url={loaderData?.cardData.frontImg}
						zoom={scale}
					/>
					<BackCard
						accessCode={loaderData?.cardData.id?.match(/.{1,4}/g).join("-")}
						producerId={loaderData?.userData.id}
						events={loaderData?.events ?? []}
						qrCode={qrCode}
						ref={backRef}
						url={loaderData?.cardData.backImg}
						zoom={scale}
					/>
				</div>
			</div>
		</FormProvider>
	);
}
