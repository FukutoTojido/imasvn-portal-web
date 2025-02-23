import { X } from "lucide-react";
import type { Dispatch, SetStateAction, RefObject } from "react";
import type { CharacterData, RefList } from "../types";
import Idol from "./Idol";
import { monthMap } from "../utils";

export default function Container({
	idolProps,
	idols,
	setIdols,
	currDate,
	setCurrDate,
}: {
	idolProps: {
		popupRefList?: RefObject<RefList>;
		cardRefList?: RefObject<RefList>;
		setShowPopup?: Dispatch<SetStateAction<boolean>>;
		setIdolInfo?: Dispatch<SetStateAction<CharacterData | undefined>>;
	};
	idols?: CharacterData[] | undefined;
	setIdols: Dispatch<SetStateAction<CharacterData[] | undefined>>;
	currDate?: Date;
	setCurrDate: Dispatch<SetStateAction<Date | undefined>>;
}) {
	const { setIdolInfo, setShowPopup, cardRefList, popupRefList } = idolProps;
	return (
		<div
			className={`bg-white sm:rounded-2xl shadow-md rounded-t-2xl p-2.5 flex flex-col gap-2.5 transition-all overflow-hidden ${idols ? "infoOut" : "infoOff"} sm:relative fixed sm:w-[400px] w-full bottom-0 left-0`}
		>
			<div className="w-full flex justify-between p-2.5">
				<div className="font-bold">
					{monthMap[currDate?.getMonth() as keyof typeof monthMap]}{" "}
					{currDate?.getDate()}, {currDate?.getFullYear()}
				</div>
				<button
					type="button"
					onClick={() => {
						setIdols(undefined);
						setCurrDate(undefined);
					}}
				>
					<X size={20} />
				</button>
			</div>
			<div className="flex flex-1 w-full flex-col gap-2.5 overflow-auto idolContainer">
				{!idols || idols.length === 0 ? (
					<div className="w-full text-center p-2.5">No event on this date</div>
				) : (
					idols.map((idol) => {
						return (
							<Idol
								charInfo={idol}
								key={idol.Character}
								setIdolInfo={setIdolInfo}
								setShowPopup={setShowPopup}
								cardRefList={cardRefList}
								popupRefList={popupRefList}
							/>
						);
					})
				)}
			</div>
		</div>
	);
}
