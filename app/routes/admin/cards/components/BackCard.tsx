import { useMemo, type RefObject } from "react";
import { useWatch } from "react-hook-form";
import type { EventData } from "../../components/UpdateEvent";

export default function BackCard({
	accessCode,
	producerId,
	events,
	qrCode,
	url,
	ref,
	zoom = 25,
}: {
	accessCode?: string;
	producerId?: string;
	events: EventData[];
	qrCode?: string;
	url?: string;
	ref?: RefObject<HTMLDivElement | null>;
	zoom?: number;
}) {
	const idol: string = useWatch({ name: "idolJapanese" });
	const imgFile: FileList | null = useWatch({ name: "backImg" });
	const event: string = useWatch({ name: "event" });

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
				className="relative w-full h-full bg-white flex flex-col shrink-0 p-[110px] gap-[50px] overflow-hidden"
				ref={ref}
			>
				<div className="absolute w-[150%] h-[150%] inset-0 m-auto gridStatic opacity-[10%] -rotate-[5deg]"></div>
				<div className="relative flex gap-[50px] w-full h-[640px]">
					<div className="h-full aspect-square shrink-0 p-[30px] flex overflow-hidden">
						<img
							src={
								(events.find((e) => e.id === +event)?.img ?? null) as
									| string
									| undefined
							}
							alt=""
							className="relative size-full object-contain object-center"
						/>
					</div>
					<div
						className="relative flex-1 h-full overflow-hidden border-[8px] rounded-[50px] border-white"
						style={{ boxShadow: "0 15px 30px 0 rgba(0 0 0 /.2)" }}
					>
						<img
							src={(image ?? url ?? null) as string | undefined}
							alt=""
							className="relative size-full object-cover object-center"
						/>
						<div
							className="absolute -bottom-[30px] right-[0px] text-right text-[190px]/[230px] text-transparent"
							style={{
								fontFamily: "Karasuma Gothic",
								WebkitTextStroke: "3px white",
								backdropFilter: "blur(120px)",
								mask: "linear-gradient(#000 0 0) text",
								WebkitMask: "linear-gradient(#000 0 0) text",
								filter: "drop-shadow(0 4px 10px rgba(0 0 0 /1)",
							}}
						>
							{idol}
						</div>
					</div>
				</div>
				<div className="relative flex-1 w-full flex gap-[50px] text-[#3D3D3D]">
					<div className="relative h-full w-[1060px] flex flex-col gap-[50px]">
						<div
							className="w-full p-[30px] rounded-[50px] bg-white flex items-center"
							style={{
								boxShadow: "0 15px 30px 0 rgba(0 0 0 /.2)",
							}}
						>
							<div
								className="w-[400px] px-[50px] text-[40px]"
								style={{
									fontFamily: "Base Neue",
									fontVariationSettings: `
                                    "wght" 617,
                                    "wdth" 100   
                                `,
								}}
							>
								access code
							</div>
							<div
								className="flex-1 text-[48px] p-2.5"
								style={{
									fontFamily: "Red Hat Mono",
								}}
							>
								{accessCode}
							</div>
						</div>
						<div className="flex gap-[50px] flex-1 w-full">
							<div
								className="h-full aspect-square bg-[#3D3D3D] rounded-[50px] border-8 border-white flex items-center justify-center"
								style={{
									boxShadow: "0 15px 30px 0 rgba(0 0 0 /.2)",
								}}
							>
								<img
									src={(qrCode ?? null) as string | undefined}
									alt="w-full h-full object-cover object-center"
								/>
							</div>
							<div className="flex-1 h-full flex flex-col gap-[50px]">
								<div
									className="w-full h-[150px] bg-white rounded-[50px] px-20 flex items-center justify-between"
									style={{
										boxShadow: "0 15px 30px 0 rgba(0 0 0 /.2)",
									}}
								>
									<div
										className="flex-1 text-[40px]"
										style={{
											fontFamily: "Base Neue",
											fontVariationSettings: `
                                            "wght" 617,
                                            "wdth" 100   
                                        `,
										}}
									>
										producer ID
									</div>
									<div
										className="text-[48px] p-2.5"
										style={{
											fontFamily: "Red Hat Mono",
										}}
									>
										{producerId}
									</div>
								</div>
								<div
									className="w-full flex-1 bg-[#3D3D3D] rounded-[50px] border-8 border-white flex items-center justify-center px-[70px] overflow-hidden"
									style={{
										boxShadow: "0 15px 30px 0 rgba(0 0 0 /.2)",
									}}
								>
									<img src="/Vector.svg" alt="" className="block" />
								</div>
							</div>
						</div>
					</div>

					<ul
						style={{
							boxShadow: "0 15px 30px 0 rgba(0 0 0 /.2)",
							fontFamily: "Base Neue",
							fontVariationSettings: `
                            "wdth" 110,
                            "wght" 488
                        `,
						}}
						className="list-disc list-inside flex flex-col justify-center gap-2.5 flex-1 h-full bg-white rounded-[50px] px-[80px] text-[31px]/[56px]"
					>
						<li>
							Thẻ này được sử dụng để truy cập THE iDOLM@STER Vietnam Portal
							thông qua công nghệ NFC.
						</li>
						<li>
							Trong trường hợp điện thoại của bạn không có NFC, xin hãy sử dụng
							mã QR bên cạnh.
						</li>
						<li>
							Nếu xảy ra lỗi trong quá trình truy cập Portal, vui lòng liên hệ
							@fukutotojido trên Discord THE iDOLM@STER Vietnam.
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
