export default function FrontCardTemplate({
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
		<div
			tw="absolute"
			style={{
				display: "flex",
				transformOrigin: "top left",
			}}
		>
			<div
				tw="relative w-[590px] h-[382px] rounded-[12px] flex flex-col shrink-0"
				style={{
					display: "flex",
					backgroundImage: `linear-gradient(to right, #fdd4ff 0%, #fee2c2 33%, #ffd9cf 67%, #ffb3b4 100% )`,
				}}
			>
				<div
					tw="relative w-full h-[253px] overflow-hidden flex"
					style={{ display: "flex" }}
				>
					<div
						tw="absolute w-full h-full flex"
						style={{
							background: `url(${import.meta.env.VITE_BASE_URL}/Frame2.png)`,
						}}
					></div>
					{(image ?? url) ? (
						<img
							src={(image ?? url ?? null) as string | undefined}
							alt=""
							tw="absolute min-h-full right-0 object-cover object-right-top"
							style={{
								display: "flex",
								scale: `${config?.scale ?? 100}%`,
								right: `${-(config?.x ?? 0)}%`,
								top: `${config?.y ?? 0}%`,
							}}
						/>
					) : (
						""
					)}
					<div
						tw="absolute bottom-[14px] left-[39px] text-[24px]/[24px] flex flex-col text-transparent"
						style={{
							fontStyle: "italic",
							fontFamily: "Base Neue 2",
							backgroundClip: "text",
							backgroundImage: "linear-gradient(to right, #FF66B5, #EFB240)",
							filter: "blur(5px)",
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
						tw="absolute bottom-[16px] left-[37px] text-[24px]/[24px] flex flex-col text-white"
						style={{
							fontStyle: "italic",
							fontFamily: "Base Neue 2",
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
					tw="relative w-full h-[129px] bg-[#212121] relative flex"
					style={{ display: "flex" }}
				>
					<div
						tw="absolute w-full h-full flex"
						style={{
							background: `url(${import.meta.env.VITE_BASE_URL}/Frame.png)`,
						}}
					></div>
					<div
						tw="absolute text-[32px]/[32px] text-transparent w-full h-full flex"
						style={{
							display: "flex",
							backgroundClip: "text",
							backgroundImage: "linear-gradient(to right, #FFEDD3, #FFC0E8)",
							fontVariationSettings: `
                                    "wght" 900,
                                    "wdth" 115
                                `,
							fontFamily: "Base Neue",
						}}
					>
						<span tw="w-[42px] h-full"></span>
						<div tw="flex flex-col flex-1" style={{ display: "flex" }}>
							<span tw="w-full h-[56px]"></span>
							{name}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
