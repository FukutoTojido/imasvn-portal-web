import type { Dispatch, RefObject, SetStateAction } from "react";
import type { CharacterData, RefList } from "../types";
import { flushSync } from "react-dom";
import Popup from "./Popup";

export default function Dialog({
	idolInfo,
	showPopup,
	popupRefList,
	cardRefList,
	setShowPopup,
	setIdolInfo,
}: {
	idolInfo: CharacterData | undefined;
	showPopup: boolean;
	popupRefList: RefObject<RefList>;
	cardRefList: RefObject<RefList>;
	setShowPopup: Dispatch<SetStateAction<boolean>>;
	setIdolInfo: Dispatch<SetStateAction<CharacterData | undefined>>;
}) {
	return (
		<dialog
			open={showPopup}
			className="bg-transparent fixed inset-0 w-screen h-screen overflow-hidden pt-[80px]"
		>
			<div className="w-full h-full flex justify-center items-center p-5">
				{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
				<div
					className="absolute top-0 left-0 w-full h-full bg-black/50 cursor-pointer"
					onClick={() => {
						if (!popupRefList?.current || !cardRefList?.current) return;

						popupRefList.current.card.style.viewTransitionName = "dialog";
						popupRefList.current.avatar.style.viewTransitionName = "avatar";
						popupRefList.current.character.style.viewTransitionName =
							"character";
						popupRefList.current.name.style.viewTransitionName = "name";
						popupRefList.current.description.style.viewTransitionName =
							"description";

						document.startViewTransition(() => {
							flushSync(() => {
								if (!popupRefList?.current || !cardRefList?.current) return;

								popupRefList.current.card.style.viewTransitionName = "none";
								popupRefList.current.avatar.style.viewTransitionName = "none";
								popupRefList.current.character.style.viewTransitionName =
									"none";
								popupRefList.current.name.style.viewTransitionName = "none";

								cardRefList.current.card.style.viewTransitionName = "dialog";
								cardRefList.current.avatar.style.viewTransitionName = "avatar";
								cardRefList.current.character.style.viewTransitionName =
									"character";
								cardRefList.current.name.style.viewTransitionName = "name";
								cardRefList.current.description.style.viewTransitionName =
									"description";

								setShowPopup(false);
								setIdolInfo(undefined);
							});
						});
					}}
					tabIndex={-1}
				/>
				<Popup idolInfo={idolInfo} popupRefList={popupRefList} />
			</div>
		</dialog>
	);
}
