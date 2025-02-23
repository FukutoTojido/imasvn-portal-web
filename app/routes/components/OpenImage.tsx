import type { ReactNode } from "react";
import { useDispatch } from "react-redux";
import { setImages } from "~/slices/image";

export default function OpenImage({
	children,
	imageSet,
	atIndex,
}: { children: ReactNode; imageSet: { url: string }[]; atIndex?: number }) {
	const dispatch = useDispatch();

	const set = () => {
		dispatch(
			setImages({
				images: imageSet,
				index: atIndex ?? 0,
			}),
		);
	};

	return (
		<button type="button" onClick={set} className="relative w-full h-full">
			{children}
		</button>
	);
}
