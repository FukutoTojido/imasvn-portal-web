import { useState } from "react";
import type { Route } from "./+types/page";
import Calendar from "./components/Calendar";
import Container from "./components/Container";
import useIdolPopup from "./hooks/useIdolPopup";
import Dialog from "./components/Dialog";
import type { CharacterData } from "./types";

// biome-ignore lint/correctness/noEmptyPattern: <explanation>
export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Calendar | THE iDOLM@STER Vietnam Portal" },
		{ name: "description", content: "THE iDOLM@STER Birthday Calendar" },
		{
			property: "og:title",
			content: "Calendar | THE iDOLM@STER Vietnam Portal",
		},
		{ property: "og:description", content: "THE iDOLM@STER Birthday Calendar" },
		{
			property: "og:image",
			content: "https://cdn.tryz.id.vn/Portal%20Image.png",
		},
		{ property: "og:url", content: "https://jibunrest.art" },
		{ name: "twitter:card", content: "summary_large_image" },
		{
			name: "twitter:title",
			content: "Calendar | THE iDOLM@STER Vietnam Portal",
		},
		{
			name: "twitter:description",
			content: "THE iDOLM@STER Birthday Calendar",
		},
		{
			name: "twitter:image",
			content: "https://cdn.tryz.id.vn/Portal%20Image.png",
		},
		{ property: "twitter:url", content: "https://jibunrest.art" },
		{ property: "twitter:domain", content: "jibunrest.art" },
	];
}

export default function Page() {
	const [idols, setIdols] = useState<CharacterData[]>();
	const [currDate, setCurrDate] = useState<Date>();
	const {
		idolInfo,
		setIdolInfo,
		showPopup,
		setShowPopup,
		cardRefList,
		popupRefList,
	} = useIdolPopup();

	return (
		<div className="xl:w-[1280px] h-full w-full flex gap-5 flex-col items-center text-primary-6 p-5 mx-auto">
			<div className="w-full text-2xl font-bold flex gap-5 items-center">
				<img
					src="/fuyuping.png"
					alt="THE iDOLM@STER Vietnam Logo"
					width={100}
					height={100}
					className="h-auto rounded-2xl"
					style={{
						objectFit: "contain",
					}}
				/>
				<div className="flex flex-col">
					THE iDOLM@STER Calendar
					<div className="text-sm font-normal">
						Powered by THE iDOLM@STER Vietnam Portal
					</div>
				</div>
			</div>
			<div className="flex w-full">
				<Calendar
					setIdols={setIdols}
					currDate={currDate}
					setCurrDate={setCurrDate}
				/>
				{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
				{/** biome-ignore lint/a11y/noStaticElementInteractions: <explanation> */}
				<div
					className={`sm:hidden ${idols ? "fixed" : "hidden"} top-0 left-0 bg-black opacity-40 w-full h-full`}
					tabIndex={-1}
					onClick={() => {
						setIdols(undefined);
						setCurrDate(undefined);
					}}
				/>
				<Container
					idolProps={{
						setIdolInfo,
						setShowPopup,
						cardRefList,
						popupRefList,
					}}
					idols={idols}
					setIdols={setIdols}
					currDate={currDate}
					setCurrDate={setCurrDate}
				/>
			</div>
			<Dialog
				showPopup={showPopup}
				setShowPopup={setShowPopup}
				idolInfo={idolInfo}
				setIdolInfo={setIdolInfo}
				cardRefList={cardRefList}
				popupRefList={popupRefList}
			/>
		</div>
	);
}
