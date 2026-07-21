import { NProgress } from "@tanem/react-nprogress";
import { useNavigation } from "react-router";

export default function Loader() {
	const { state } = useNavigation();

	return (
		<NProgress isAnimating={state === "loading"}>
			{({ animationDuration, isFinished, progress }) => (
				<div className="fixed w-full top-0 left-0 h-0.5 z-99">
					<div
						className="bg-text h-full"
						style={{
							opacity: isFinished ? 0 : 1,
							width: `${progress * 100}%`,
							transition: `ease-in-out ${animationDuration}ms`,
						}}
					></div>
				</div>
			)}
		</NProgress>
	);
}
