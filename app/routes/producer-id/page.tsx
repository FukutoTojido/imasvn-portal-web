import axios from "axios";
import { useEffect, useRef, useState } from "react";
import type { Route } from "./+types/page";

export async function loader({ params: { id } }: Route.LoaderArgs) {
	try {
		const { data: cardData } = await axios.get(
			`${import.meta.env.VITE_BACKEND_API}/producer-id/_/cards/${id}`,
		);
		const { data: userData } = await axios.get(
			`${import.meta.env.VITE_BACKEND_API}/producer-id/${cardData.pid}`,
		);

		return {
			cardData,
			userData,
		};
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
			setScale(Math.min(height / 1286, width / 800));
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
			<link rel="preload" href={loaderData.cardData.img} as="image"></link>
			<link rel="preload" href="/Base.svg" as="image"></link>
			<link rel="preload" href="/Back.svg" as="image"></link>
			<div
				className="w-[500px] max-w-full h-full flex items-center justify-center relative"
				ref={ref}
			>
				<div
					className="w-[800px] h-[1286px] relative shrink-0 producer-id"
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
									className="absolute top-[142px] left-[104px] w-[128px] h-[106px]"
								/>
								<div className="absolute text-[34px] top-[138px] left-[296px] leading-[34px]">
									{loaderData.cardData.name}
								</div>
								<div className="absolute text-[68px] top-[182px] left-[296px] leading-[68px]">
									{loaderData.cardData.idol}
								</div>
								<img
									src={loaderData.cardData.img}
									alt=""
									className="w-[532px] h-[512px] absolute left-[128px] top-[358px] rounded-[12px] object-cover object-center"
								/>
								<div
									className="absolute text-[36.5px] leading-[50px] text-center left-0 right-0 mx-auto top-[903px]"
									style={{
										fontFamily: `"DM Serif Text", Rubik, sans-serif`,
									}}
								>
									{loaderData.cardData.title}
								</div>
								<img
									src="/rank.svg"
									alt=""
									className="absolute top-[988px] left-[110px] w-[116px] h-[130px]"
								/>
								<div
									className="absolute top-[996px] left-[252px] font-bold text-[28px] leading-[38px]"
									style={{
										fontFamily: `"Victor Mono", Rubik, sans-serif`,
									}}
								>
									Events participated: {loaderData.userData.events.toString().padStart(4, "0")}
								</div>
								<div
									className="absolute top-[1030px] left-[252px] font-bold text-[28px] leading-[38px]"
									style={{
										fontFamily: `"Victor Mono", Rubik, sans-serif`,
									}}
								>
									Number of fans:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;9999
								</div>
								<div
									className="absolute top-[2172px] left-[493px] font-bold text-[56px] leading-[76px] tracking-[0.415em]"
									style={{
										fontFamily: `"Victor Mono", Rubik, sans-serif`,
									}}
								>
									{loaderData.cardData.id}
								</div>
								<img
									src="/NFC.svg"
									alt=""
									className="absolute top-[1179.24px] left-[90px] w-[170px] h-[21.52px]"
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
