import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DateTime } from "luxon";
import { Fragment, useEffect, useRef, useState } from "react";
import type { EventData } from "../admin/components/UpdateEvent";
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

const columns: ColumnDef<EventData>[] = [
	{
		accessorKey: "img",
		cell: (props) => (
			<img
				src={(props.cell.getValue() as string) ?? null}
				alt=""
				width={120}
				height={120}
			/>
		),
	},
	{
		id: "info",
		cell: (props) => (
			<div className="flex flex-col gap-2.5">
				<div className="line-clamp-2">{props.row.original.name}</div>
				<div>
					{DateTime.fromISO(props.row.original.startDate).toFormat(
						"dd LLL yyyy",
					)}{" "}
					-{" "}
					{DateTime.fromISO(props.row.original.endDate).toFormat("dd LLL yyyy")}
				</div>
			</div>
		),
	},
];

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

	const table = useReactTable({
		data: loaderData?.userData.events ?? [],
		columns,
		initialState: {
			pagination: {
				pageIndex: 0,
				pageSize: 3,
			},
		},
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	const baseRef = useRef<HTMLDivElement>(null);
	const infoRef = useRef<HTMLDivElement>(null);
	const contRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let ev: EventListenerOrEventListenerObject | undefined;

		const timeout = setTimeout(() => {
			ev = contRef.current?.addEventListener("click", () => {
				baseRef.current?.classList.toggle("opacity-0");
				infoRef.current?.classList.toggle("opacity-0");
			}) as EventListenerOrEventListenerObject | undefined;
		}, 7000);

		return () => {
			clearTimeout(timeout);
			if (ev) contRef.current?.removeEventListener("click", ev);
		};
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
				className="w-[500px] max-w-full h-full flex items-center justify-center relative select-none"
				ref={ref}
			>
				<div
					className="w-[800px] h-[1286px] relative shrink-0 producer-id cursor-pointer"
					style={{
						transform: `scale(${scale * 100}%)`,
					}}
					ref={contRef}
				>
					<div className="absolute top-0 left-0 w-full h-full producer-id-inner pointer-events-none">
						<div className="absolute top-0 left-0 w-full h-full card-front">
							<img
								src="/Base.svg"
								alt=""
								className="w-full h-full object-cover object-center block"
							/>
							<div
								className="absolute top-[96px] left-[90px] w-[613px] h-[1078px] bg-black text-[#57ff89] text-4xl opacity-0 transition-opacity"
								style={{
									fontFamily: "Classic Console Neue",
								}}
								ref={infoRef}
							>
								<div
									className="w-full h-full overflow-auto flex flex-col p-5 gap-5"
									style={{
										filter: "drop-shadow(0 0 10px #57ff89)",
									}}
								>
									Producer Info
									<ul>
										<li className="text-3xl list-disc list-inside">
											ID: {loaderData.userData.id}
										</li>
										<li className="text-3xl list-disc list-inside">
											Name: {loaderData.userData.name}
										</li>
										<li className="text-3xl list-disc list-inside">
											Event Participated: {loaderData.userData.events.length}
										</li>
									</ul>
									<div className="flex flex-col gap-2.5">
										{(table.getRowModel().rows ?? []).map((row) => (
											<div
												className="w-full flex items-center gap-5 text-2xl border-2 border-[#57ff89] p-5"
												key={row.id}
											>
												{row.getVisibleCells().map((cell) => (
													<Fragment key={cell.id}>
														{flexRender(
															cell.column.columnDef.cell,
															cell.getContext(),
														)}
													</Fragment>
												))}
											</div>
										))}
									</div>
									<div className="w-full flex items-center justify-end gap-2.5">
										<button
											type="button"
											className="p-5 border-2 border-[#57ff89] disabled:opacity-20"
											onClick={() => table.previousPage()}
											disabled={!table.getCanPreviousPage()}
										>
											<ChevronLeft />
										</button>
										<button
											type="button"
											className="p-5 border-2 border-[#57ff89] disabled:opacity-20"
											onClick={() => table.nextPage()}
											disabled={!table.getCanNextPage()}
										>
											<ChevronRight />
										</button>
									</div>
								</div>
							</div>
							<div
								className="absolute top-0 left-0 w-full h-full ink transition-opacity"
								ref={baseRef}
							>
								<img
									src="/classification.svg"
									alt=""
									className="absolute top-[142px] left-[104px] w-[128px] h-[106px]"
								/>
								<div className="absolute text-[34px] top-[138px] left-[296px] leading-[34px]">
									{loaderData.cardData.name}
								</div>
								<div className="absolute text-[68px] top-[182px] left-[296px] leading-[68px]">
									{loaderData.cardData.idolJapanese}
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
									Events participated:{" "}
									{loaderData.userData.events.length
										.toString()
										.padStart(4, "0")}
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
									className="absolute top-[1086px] left-[246.5px] font-bold text-[28px] leading-[38px] tracking-[0.415em]"
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
