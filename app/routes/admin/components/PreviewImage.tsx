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

type FormType = {
	name: string;
	idol: string;
	title: string;
	img?: FileList | null;
};

export default function PreviewImage({
	url,
	ref,
}: {
	url?: string;
	ref: RefObject<{ getImage: () => Promise<File | null> } | null>;
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
					"relative col-span-full aspect-square bg-mantle rounded-md border-dashed border-overlay-0 bg-center bg-cover overflow-hidden p-5",
					url || objectUrl ? "" : "border-1",
				)}
			>
				<div className="relative w-full h-full rounded-xl overflow-hidden">
					{url && !objectUrl ? (
						<img
							src={url}
							alt=""
							className="w-full h-full object-cover object-center rounded-xl"
						/>
					) : (
						""
					)}
					{objectUrl ? (
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
