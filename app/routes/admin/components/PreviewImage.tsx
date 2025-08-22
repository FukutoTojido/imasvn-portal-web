import {
	useCallback,
	useImperativeHandle,
	useMemo,
	useState,
	type RefObject,
} from "react";
import Cropper, { type Area } from "react-easy-crop";
import { useWatch } from "react-hook-form";
import { cn } from "~/lib/utils";
import getCroppedImg from "../utils";
import type { ClassValue } from "clsx";

type FormType = {
	name: string;
	idol: string;
	title: string;
	img?: FileList | null;
};

export default function PreviewImage({
	url,
	ref,
	cropper = true,
	className = ""
}: {
	url?: string;
	ref: RefObject<{ getImage: () => Promise<File | null> } | null>;
	cropper?: boolean;
	className?: ClassValue
}) {
	const img = useWatch<FormType>({ name: "img" });
	const objectUrl = useMemo(
		() => (img ? URL.createObjectURL(new Blob([img[0]])) : null),
		[img],
	);
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
		x: number;
		y: number;
		width: number;
		height: number;
	}>();

	const onCropComplete = (
		_: Area,
		croppedAreaPixels: {
			x: number;
			y: number;
			width: number;
			height: number;
		},
	) => {
		setCroppedAreaPixels(croppedAreaPixels);
	};

	const cropImage = useCallback(async () => {
		if (!objectUrl || !croppedAreaPixels) return null;

		const croppedImage = await getCroppedImg(objectUrl, croppedAreaPixels);
		return croppedImage;
	}, [croppedAreaPixels, objectUrl]);

	useImperativeHandle(ref, () => ({ getImage: cropImage }), [cropImage]);

	return (
		<>
			<div
				className={cn(
					"relative col-span-full bg-mantle rounded-md border-dashed border-overlay-0 bg-center bg-cover overflow-hidden p-5",
					url || objectUrl ? "" : "border-1",
					cropper ? "aspect-square" : "",
					className
				)}
			>
				<div className="relative w-full h-full rounded-xl overflow-hidden">
					{(!cropper && (url || objectUrl)) ||
					(cropper && url && !objectUrl) ? (
						<img
							src={url ?? objectUrl ?? undefined}
							alt=""
							className="w-full h-full object-cover object-center rounded-xl"
						/>
					) : (
						""
					)}
					{objectUrl && cropper ? (
						<Cropper
							image={objectUrl}
							aspect={1}
							crop={crop}
							zoom={zoom}
							onCropChange={setCrop}
							onZoomChange={setZoom}
							zoomSpeed={0.3}
							classes={{
								containerClassName: "w-full h-full",
								cropAreaClassName: "rounded-xl",
								mediaClassName: "object-cover max-w-[initial]",
							}}
							objectFit="cover"
							onCropComplete={onCropComplete}
						/>
					) : (
						""
					)}
				</div>
			</div>
		</>
	);
}
