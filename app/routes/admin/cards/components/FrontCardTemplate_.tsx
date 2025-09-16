import { twj } from "tw-to-css";

export default function FrontCardTemplate_({
	url,
	idol,
	image,
	config,
	name,
}: {
	url?: string;
	idol?: string;
	image?: string;
	name?: string;
	config?: {
		x?: number;
		y?: number;
		scale?: number;
	};
}) {
	return (
		<div style={twj("absolute flex origin-top-left")}>
			<div
				style={{
					backgroundImage: `linear-gradient(to right, #fdd4ff 0%, #fee2c2 33%, #ffd9cf 67%, #ffb3b4 100% )`,
					...twj(
						"relative w-[590px] h-[382px] rounded-[12px] flex flex-col shrink-0",
					),
				}}
			>
				<div style={twj("relative w-full h-[253px] overflow-hidden flex")}>
					<div
						style={{
							background: `url(${import.meta.env.VITE_BASE_URL}/Frame2.png)`,
							...twj("absolute w-full h-full flex"),
						}}
					></div>
					{(image ?? url) ? (
						<img
							src={(image ?? url ?? null) as string | undefined}
							alt=""
							style={{
								display: "flex",
								transform: `scale(${(config?.scale ?? 100) / 100})`,
								right: `${-(config?.x ?? 0)}%`,
								top: `${config?.y ?? 0}%`,
								imageRendering: "auto",
								...twj(
									"absolute min-h-full right-0 object-cover object-right-top",
								),
							}}
							height={382}
						/>
					) : (
						""
					)}
					<div
						style={{
							fontStyle: "italic",
							fontFamily: "Base Neue V",
							backgroundClip: "text",
							backgroundImage: "linear-gradient(to right, #FF66B5, #EFB240)",
							filter: "blur(5px)",
							...twj(
								"absolute bottom-[14px] left-[39px] text-[24px]/[24px] flex flex-col text-transparent",
							),
						}}
					>
						{idol
							?.toUpperCase()
							.split(" ")
							.map((text) => (
								<span key={text}>{text}</span>
							))}
					</div>
					<div
						style={{
							fontStyle: "italic",
							fontFamily: "Base Neue V",
							fontVariationSettings: `
                                "wdth" 150,
                                "wght" 712.5,
                                "obli" 1
                            `,
							...twj(
								"absolute bottom-[16px] left-[37px] text-[24px]/[24px] flex flex-col text-white",
							),
						}}
					>
						{idol
							?.toUpperCase()
							.split(" ")
							.map((text) => (
								<span key={text}>{text}</span>
							))}
					</div>
				</div>
				<div
					style={twj("relative w-full h-[129px] bg-[#212121] relative flex")}
				>
					<div
						style={{
							background: `url(${import.meta.env.VITE_BASE_URL}/Frame.png)`,
							...twj("absolute w-full h-full flex"),
						}}
					></div>
					<div
						style={{
							// backgroundClip: "text",
							// backgroundImage: "linear-gradient(to right, #FFEDD3, #FFC0E8)",
							...twj(
								"absolute text-[32px]/[32px] text-transparent w-full h-full flex ",
							),
						}}
					>
						<span style={twj("w-[42px] h-full")}></span>
						<div
							style={{
								...twj("flex flex-col flex-1 text-[#FFEDD3]"),
								fontFamily: "Base Neue V",
                                fontWeight: 900,
								// fontVariationSettings: `"wdth" 115`,
							}}
						>
							<span style={twj("w-full h-[56px]")}></span>
							{name}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
