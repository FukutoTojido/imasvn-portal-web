import { Fragment, type RefObject, useMemo } from "react";
import { useWatch } from "react-hook-form";

export default function FrontCard({
	ref,
	url,
	zoom = 25,
}: {
	ref?: RefObject<HTMLDivElement | null>;
	url?: string;
	zoom?: number;
}) {
	const name: string = useWatch({ name: "name" });
	const idol: string = useWatch({ name: "idol" });
	const imgFile: FileList | null = useWatch({ name: "frontImg" });
	const x: number = useWatch({ name: "config.x" });
	const y: number = useWatch({ name: "config.y" });
	const scale: number = useWatch({ name: "config.scale" });

	const image = useMemo(() => {
		if (!imgFile || !imgFile.length) return;
		const file = imgFile[0];
		const dataURL = URL.createObjectURL(new Blob([file]));
		return dataURL;
	}, [imgFile]);

	return (
		<div
			className="relative w-[2360px] h-[1528px] overflow-hidden rounded-[50px]"
			style={{ zoom: `${zoom}%` }}
		>
			<div
				className="relative w-full h-full bg-gradient-to-right card-gradient flex flex-col shrink-0"
				ref={ref}
			>
				<div className="relative w-full h-[1012px] overflow-hidden">
					<div
						className="absolute w-full h-full left-[100%] mix-blend-soft-light"
						style={{
							filter: "drop-shadow(-2360px 0 0 black)",
						}}
					>
						<img
							src="/Tunnel.svg"
							alt=""
							className="absolute w-full h-full"
							style={{
								maskImage:
									"linear-gradient(to right, transparent 0%, white 42%, white 100%)",
							}}
						/>
						<img src="/ML.svg" alt="" className="absolute h-full right-0" />
						<img
							src={(image ?? url ?? null) as string | undefined}
							alt=""
							className="absolute min-h-full w-full -right-10 object-cover object-right-top"
							style={{
								scale: `${scale ?? 100}%`,
								right: `calc(${-x}% - 10px)`,
								top: `${y}%`,
							}}
						/>
					</div>
					<img
						src={(image ?? url ?? null) as string | undefined}
						alt=""
						className="absolute min-h-full w-full right-0 object-cover object-right-top"
						style={{
							scale: `${scale ?? 100}%`,
							right: `${-x}%`,
							top: `${y}%`,
						}}
					/>
					<div
						className="absolute w-full h-full top-0 left-0 card-gradient"
						style={{
							maskImage: "url(/NFC.svg)",
							maskRepeat: "no-repeat",
							maskPosition: "150px 150px",
							backdropFilter: "blur(16px)",
						}}
					></div>
					<div
						className="absolute w-full h-full top-0 left-0 bg-black mix-blend-overlay"
						style={{
							maskImage: "url(/NFC.svg)",
							maskRepeat: "no-repeat",
							maskPosition: "150px 150px",
							backdropFilter: "blur(16px)",
						}}
					></div>
					<div
						className="absolute w-full h-full top-0 left-0 bg-black mix-blend-overlay"
						style={{
							maskImage: "url(/NFC.svg)",
							maskRepeat: "no-repeat",
							maskPosition: "150px 150px",
						}}
					></div>
					<div
						className="absolute w-full h-full top-0 left-0 bg-white opacity-[13%]"
						style={{
							maskImage: "url(/NFC.svg)",
							maskRepeat: "no-repeat",
							maskPosition: "150px 150px",
						}}
					></div>
					<div
						className="absolute bottom-[62px] left-[150px] text-[96px]/[96px] bg-gradient-to-r from-[#FF66B5] to-[#EFB240]"
						style={{
							fontVariationSettings: `
                            	"wdth" 150,
                            	"wght" 712.5,
                            	"obli" 1
                        	`,
							fontFamily: "Base Neue",
							backgroundClip: "text",
							WebkitTextStroke: "2px transparent",
							filter: "drop-shadow(6px 6px 5px rgba(0 0 0 / .2))",
						}}
					>
						{idol
							?.toUpperCase()
							.split(" ")
							.map((text) => (
								<Fragment key={text}>
									{text}
									<br />
								</Fragment>
							))}
					</div>
				</div>
				<div className="w-full h-[516px] bg-[#212121] relative">
					<div
						className="absolute w-full h-full opacity-[8%]"
						style={{
							maskImage: "url(/Grid.svg)",
							backgroundImage:
								"linear-gradient(to right, black, black), linear-gradient(to right, #FFEDD3, #FFC0E8)",
							backgroundBlendMode: "overlay, normal",
						}}
					></div>
					<div
						className="absolute w-full h-full opacity-50"
						style={{
							maskImage: "url(/Looper.svg)",
							backgroundImage:
								"linear-gradient(to right, black, black), linear-gradient(to right, #FFEDD3, #FFC0E8)",
							backgroundBlendMode: "overlay, normal",
						}}
					></div>
					<div
						className="absolute w-full h-full"
						style={{
							maskImage: "url(/Producer.svg)",
							maskRepeat: "no-repeat",
							maskPosition: "170px 78px",
							backgroundImage:
								"linear-gradient(to right, black, black), linear-gradient(to right, #FFEDD3, #FFC0E8)",
							backgroundBlendMode: "overlay, normal",
						}}
					></div>
					<div
						className="absolute text-[128px]/[128px] text-transparent w-full h-full flex"
						style={{
							backgroundClip: "text",
							backgroundImage:
								"linear-gradient(to right, black, black), linear-gradient(to right, #FFEDD3, #FFC0E8)",
							backgroundBlendMode: "overlay, normal",
							fontVariationSettings: `
                                "wght" 900,
                                "wdth" 115
                            `,
							fontFamily: "Base Neue",
						}}
					>
						<span className="w-[170px] h-full"></span>
						<div className="flex flex-col flex-1">
							<span className="w-full h-[224px]"></span>
							{name}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
