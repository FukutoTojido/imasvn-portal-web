import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { type KeyboardEvent, useEffect, useRef } from "react";
import { setImages } from "~/slices/image";

export default function ImageViewer() {
	const ref = useRef<HTMLDivElement>(null);
	const dispatch = useDispatch();

	const state = useSelector(
		(state: {
			image: {
				images: { url: string }[];
				index: number;
			};
		}) => state.image,
	);

	const nextPage = () => {
		if (state.index === state.images.length - 1) return;
		dispatch(
			setImages({
				...state,
				index: state.index + 1,
			}),
		);
	};

	const prevPage = () => {
		if (state.index === 0) return;
		dispatch(
			setImages({
				...state,
				index: state.index - 1,
			}),
		);
	};

	const reset = () => {
		dispatch(
			setImages({
				images: [],
				index: 0,
			}),
		);
	};

	const handleClick = (event: MouseEvent) => {
		if ((event.target as HTMLElement)?.tagName !== "DIV") return;
		reset();
	};

	const handleKey = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.key === "ArrowLeft") prevPage();
		if (event.key === "ArrowRight") nextPage();
		if (event.key === "Esc") reset();
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!ref.current) return;
		ref.current.addEventListener("click", handleClick);
		ref.current.focus();

		return () => {
			ref.current?.removeEventListener("click", handleClick);
		};
	}, [ref]);

	if (!state.images.length || !state.images) {
		return <div className="hidden" ref={ref} />;
	}

	return (
		<div
			className="fixed top-0 left-0 w-full h-full md:p-20 md:px-40 p-5 bg-black/50 fadeIn z-50"
			onKeyDown={handleKey}
			tabIndex={-1}
			ref={ref}
		>
			<div
				className="relative flex h-full transition-transform gap-10 pop"
				style={{
					transform: `translateX(calc(-${state.index * 100}% - ${state.index * 40}px))`,
				}}
			>
				{state.images.map((image) => (
					<div
						className="relative w-full h-full flex-shrink-0 rounded-xl flex items-center justify-center"
						key={image.url}
					>
						<img
							src={image.url}
							alt=""
							width={0}
							height={0}
							sizes="100vw"
							className="w-auto h-auto max-w-full max-h-full object-contain select-none rounded-2xl bg-black/50"
						/>
					</div>
				))}
			</div>
			<button
				type="button"
				className="absolute top-0 bottom-0 left-0 h-min m-5 my-auto aspect-square px-5 rounded-full bg-black/50 hover:bg-white/20 flex items-center transition-colors disabled:opacity-20 disabled:hover:bg-black/50"
				onClick={prevPage}
				disabled={state.index === 0}
			>
				<ArrowLeft />
			</button>
			<button
				type="button"
				className="absolute top-0 bottom-0 right-0 h-min m-5 my-auto aspect-square px-5 rounded-full bg-black/50 hover:bg-white/20 flex items-center transition-colors disabled:opacity-20 disabled:hover:bg-black/50"
				onClick={nextPage}
				disabled={state.index === state.images.length - 1}
			>
				<ArrowRight />
			</button>
			<button
				type="button"
				className="absolute top-0 right-0 rounded-full hover:bg-white/20 p-5 m-5"
				onClick={reset}
			>
				<X />
			</button>
		</div>
	);
}
