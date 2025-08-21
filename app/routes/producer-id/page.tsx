import { useEffect, useRef, useState } from "react";
import type { Route } from "./+types/page";
import axios from "axios";

export async function loader({ params: { id } }: Route.LoaderArgs) {
	try {
		const { data } = await axios.get(
			`${import.meta.env.VITE_BACKEND_API}/producer-id/_/cards/${id}`,
		);
		return data;
	} catch (e) {
		console.error(e);
		return null;
	}
}

export default function Page({ loaderData }: Route.ComponentProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [scale, setScale] = useState(0);

	useEffect(() => {
		if (!ref.current) return;
		const resizeObserver = new ResizeObserver((entries) => {
			const [ele] = entries;
			if (!ele) return;

			const width = ele.contentRect.width;
			const height = ele.contentRect.height;
			setScale(Math.min(height / 2572, width / 1600));
		});

		resizeObserver.observe(ref.current);

		return () => resizeObserver.disconnect();
	}, []);

	if (!loaderData) return "";
	return (
		<div
			className="w-screen h-screen gridLoop bg-crust flex items-center justify-center p-5 overflow-hidden text-[#344265]"
			style={{
				fontFamily: "DFPOPMix, Rubik, sans-serif",
			}}
		>
			<link rel="preload" href={loaderData.img} as="image"></link>
			<link rel="preload" href="/Base.svg" as="image"></link>
			<link rel="preload" href="/Back.svg" as="image"></link>
			<div
				className="w-[500px] max-w-full h-full flex items-center justify-center relative"
				ref={ref}
			>
				<div
					className="w-[1600px] h-[2572px] relative shrink-0 producer-id"
					style={{
						transform: `scale(${scale * 100}%)`,
					}}
				>
					<div className="absolute top-0 left-0 w-full h-full producer-id-inner">
						<div className="absolute top-0 left-0 w-full h-full card-front">
							<img
								src="/Base.svg"
								alt=""
								className="w-full h-full object-cover object-center block"
							/>
							<div className="absolute top-0 left-0 w-full h-full ink">
								<img
									src="/classification.svg"
									alt=""
									className="absolute top-[284px] left-[208px] w-[256px] h-[212px]"
								/>
								<div className="absolute text-[68px] top-[276px] left-[592px] leading-[68px]">
									{loaderData.name}
								</div>
								<div className="absolute text-[136px] top-[364px] left-[592px] leading-[136px]">
									{loaderData.idol}
								</div>
								<img
									src={loaderData.img}
									alt=""
									className="w-[1064px] h-[1024px] absolute left-[256px] top-[716px] rounded-[24px] object-cover object-center"
								/>
								<div
									className="absolute text-[73px] leading-[100px] text-center left-0 right-0 mx-auto top-[1806px]"
									style={{
										fontFamily: `"DM Serif Text", Rubik, sans-serif`,
									}}
								>
									{loaderData.title}
								</div>
								<img
									src="/rank.svg"
									alt=""
									className="absolute top-[1976px] left-[220px] w-[232px] h-[260px]"
								/>
								<div
									className="absolute top-[1992px] left-[504px] font-bold text-[56px] leading-[76px]"
									style={{
										fontFamily: `"Victor Mono", Rubik, sans-serif`,
									}}
								>
									Events participated: 0001
								</div>
								<div
									className="absolute top-[2060px] left-[504px] font-bold text-[56px] leading-[76px]"
									style={{
										fontFamily: `"Victor Mono", Rubik, sans-serif`,
									}}
								>
									Number of fans:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;9999
								</div>
								<img
									src="/NFC.svg"
									alt=""
									className="absolute top-[2358.48px] left-[180px] w-[340px] h-[43.04px]"
								/>
							</div>
							<div className="absolute w-full h-[20px] rounded-full blur bg-[#80ffaa] scanner"></div>
						</div>
						<div className="absolute top-0 left-0 w-full h-full card-back">
							<img
								src="/Back.svg"
								alt=""
								className="w-full h-full object-cover object-center block"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
