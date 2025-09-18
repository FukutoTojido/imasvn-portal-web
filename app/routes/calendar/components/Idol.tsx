import {
	type Dispatch,
	type SetStateAction,
	type RefObject,
	useRef,
} from "react";
import { flushSync } from "react-dom";

import type { CharacterData, RefList } from "../types";

export default function Idol({
	charInfo,
	popupRefList,
	cardRefList,
	setShowPopup,
	setIdolInfo,
}: {
	charInfo?: CharacterData;
	popupRefList?: RefObject<RefList>;
	cardRefList?: RefObject<RefList>;
	setShowPopup?: Dispatch<SetStateAction<boolean>>;
	setIdolInfo?: Dispatch<SetStateAction<CharacterData | undefined>>;
}) {
	const ref = useRef<HTMLButtonElement>(null);
	const avaRef = useRef<HTMLImageElement>(null);
	const characterRef = useRef<HTMLDivElement>(null);
	const nameRef = useRef<HTMLDivElement>(null);
	const descriptionRef = useRef<HTMLDivElement>(null);

	if (!charInfo || !cardRefList?.current || !popupRefList?.current) {
		return (
			<div className="bg-primary-3 w-full rounded-md flex gap-5 p-5 text-primary-6 hover:-translate-y-1 transition-transform select-none">
				<div className="w-[50px] h-[50px] rounded-md bg-primary-2 object-cover object-top shrink-0 skeleton2" />
				<div className="flex-1 flex flex-col gap-2.5">
					<div className="text-lg font-bold h-[1em] w-full skeleton2 bg-primary-6 rounded-md" />
					<div className="text-sm line-clamp-1 h-[1em] w-1/2 skeleton2 bg-primary-6 rounded-md" />
				</div>
			</div>
		);
	}

	return (
		<button
			ref={ref}
			onClick={() => {
				if (
					cardRefList.current.card &&
					cardRefList.current.avatar &&
					cardRefList.current.character &&
					cardRefList.current.name
				) {
					cardRefList.current.card.style.viewTransitionName = "none";
					cardRefList.current.avatar.style.viewTransitionName = "none";
					cardRefList.current.character.style.viewTransitionName = "none";
					cardRefList.current.name.style.viewTransitionName = "none";
					cardRefList.current.description.style.viewTransitionName = "none";
				}

				cardRefList.current.card = ref.current;
				cardRefList.current.card.style.viewTransitionName = "dialog";

				cardRefList.current.avatar = avaRef.current;
				cardRefList.current.avatar.style.viewTransitionName = "avatar";

				cardRefList.current.character = characterRef.current;
				cardRefList.current.character.style.viewTransitionName = "character";

				cardRefList.current.name = nameRef.current;
				cardRefList.current.name.style.viewTransitionName = "name";

				cardRefList.current.description = descriptionRef.current;
				cardRefList.current.description.style.viewTransitionName =
					"description";

				document.startViewTransition(() => {
					flushSync(() => {
						if (!popupRefList?.current) return;

						cardRefList.current.card.style.viewTransitionName = "none";
						cardRefList.current.avatar.style.viewTransitionName = "none";
						cardRefList.current.character.style.viewTransitionName = "none";
						cardRefList.current.name.style.viewTransitionName = "none";
						cardRefList.current.description.style.viewTransitionName = "none";

						popupRefList.current.card.style.viewTransitionName = "dialog";
						popupRefList.current.avatar.style.viewTransitionName = "avatar";
						popupRefList.current.character.style.viewTransitionName =
							"character";
						popupRefList.current.name.style.viewTransitionName = "name";
						popupRefList.current.description.style.viewTransitionName =
							"description";

						setShowPopup?.(true);
						setIdolInfo?.(charInfo);
					});
				});
			}}
			type="button"
			className="rounded-md flex items-center text-text transition-all select-none cursor-pointer hover:bg-surface-0 bg-base border border-surface-1 overflow-hidden"
		>
			<img
				ref={avaRef}
				src={charInfo.icon}
				alt=""
				className="h-[100px] aspect-square rounded-md object-cover object-top shrink-0 avatar scale-125"
				style={{
					maskImage: "linear-gradient(to right, white 60%, transparent 90%)"
				}}
			/>
			<div className="flex-1 flex flex-col text-left p-5">
				<div className="text-lg font-medium character" ref={characterRef}>
					{charInfo.name}
				</div>
				<div className="text-sm line-clamp-1 name" ref={nameRef}>
					{charInfo.japaneseName}
				</div>
				{charInfo.imageColor ? (
					<div
						className="w-8 h-2 rounded-full mt-2"
						style={{
							backgroundColor: charInfo.imageColor ?? "",
						}}
					/>
				) : (
					""
				)}

				<div className="w-full" ref={descriptionRef} />
			</div>
		</button>
	);
}
