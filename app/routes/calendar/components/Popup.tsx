import { type HTMLProps, type RefObject, useEffect, useRef } from "react";
import type { CharacterData, RefList } from "../types";
import { DateTime } from "luxon";

export default function Popup({
	idolInfo,
	popupRefList,
	...props
}: {
	idolInfo?: CharacterData;
	popupRefList: RefObject<RefList>;
} & HTMLProps<HTMLDivElement>) {
	const ref = useRef<HTMLDivElement>(null);
	const avaRef = useRef<HTMLImageElement>(null);
	const characterRef = useRef<HTMLDivElement>(null);
	const nameRef = useRef<HTMLDivElement>(null);
	const descriptionRef = useRef<HTMLUListElement>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: Init
	useEffect(() => {
		if (!popupRefList?.current) return;
		popupRefList.current.card = ref.current;
		popupRefList.current.avatar = avaRef.current;
		popupRefList.current.character = characterRef.current;
		popupRefList.current.name = nameRef.current;
		popupRefList.current.description = descriptionRef.current;
	}, []);

	return (
		<div
			ref={ref}
			className="max-w-full max-h-full overflow-auto w-[800px] p-5 bg-base border border-surface-1 rounded-xl flex gap-5 text-text flex-col sm:flex-row items-center sm:items-start"
			{...{ ...props }}
		>
			<img
				ref={avaRef}
				src={idolInfo?.icon ?? "/fuyuping.png"}
				alt=""
				width={240}
				height={240}
				className="w-[240px] h-[240px] rounded-xl sm:bg-surface-0 object-cover object-top border border-surface-1"
			/>
			<div className="sm:h-full h-auto flex-1 flex-col flex gap-5 w-full">
				<div className="w-full sm:w-auto flex flex-col text-center sm:text-left">
					<div className="text-3xl font-bold" ref={characterRef}>
						{idolInfo?.name}
					</div>
					<div className="text-lg line-clamp-1" ref={nameRef}>
						{idolInfo?.japaneseName ?? ""}
					</div>
				</div>
				<div className="flex-1 bg-surface-0 w-full p-5 rounded-xl text-sm border border-surface-1">
					<ul className="w-full" ref={descriptionRef}>
						<li>
							<span className="font-bold">Voice Actor</span>: {idolInfo?.VA} (
							{idolInfo?.japaneseVA})
						</li>
						<li>
							<span className="font-bold">Birthday</span>:{" "}
							{DateTime.fromFormat(
								`${idolInfo?.birthdate}/${idolInfo?.birthmonth}`,
								"d/m",
							).toFormat("dd LLL")}
						</li>
						<li>
							<span className="font-bold">Image Color</span>:{" "}
							<span
								className="rounded-sm leading-[10px] inline-block"
								style={{ backgroundColor: idolInfo?.imageColor }}
							>
								&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
							</span>{" "}
							{idolInfo?.imageColor}
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
