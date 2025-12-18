import axios from "axios";
import { useMemo, useState } from "react";
import useSWR from "swr";
import Input from "~/routes/components/Input";
import Dialog from "../components/Dialog";
import Idol from "../components/Idol";
import useIdolPopup from "../hooks/useIdolPopup";
import type { CharacterData } from "../types";
import Fuse from "fuse.js";

export function meta() {
	return [
		{ title: "Characters | THE iDOLM@STER Vietnam Portal" },
		{ name: "description", content: "THE iDOLM@STER Characters Lookup" },
		{
			property: "og:title",
			content: "Characters | THE iDOLM@STER Vietnam Portal",
		},
		{ property: "og:description", content: "THE iDOLM@STER Characters Lookup" },
		{
			property: "og:image",
			content: "https://cdn.tryz.id.vn/Portal%20Image.png",
		},
		{ property: "og:url", content: "https://jibunrest.art" },
		{ name: "twitter:card", content: "summary_large_image" },
		{
			name: "twitter:title",
			content: "Characters | THE iDOLM@STER Vietnam Portal",
		},
		{
			name: "twitter:description",
			content: "THE iDOLM@STER Characters Lookup",
		},
		{
			name: "twitter:image",
			content: "https://cdn.tryz.id.vn/Portal%20Image.png",
		},
		{ property: "twitter:url", content: "https://jibunrest.art" },
		{ property: "twitter:domain", content: "jibunrest.art" },
	];
}

// biome-ignore lint/suspicious/noExplicitAny: hehe
export const debounce = (fn: (...agrs: any) => void, timeout = 300) => {
	let timer: string | number | NodeJS.Timeout | undefined;
	// biome-ignore lint/suspicious/noExplicitAny: he
	return (...agrs: any) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			fn.apply(this, agrs);
		}, timeout);
	};
};

export default function Page() {
	const {
		idolInfo,
		setIdolInfo,
		showPopup,
		setShowPopup,
		cardRefList,
		popupRefList,
	} = useIdolPopup();

	const { data } = useSWR("characters", async () => {
		const res = await axios.get(
			`${import.meta.env.VITE_BACKEND_API}/characters`,
		);
		return res.data;
	});

	const fuse = useMemo(() => {
		if (!data) return null;
		return new Fuse<CharacterData>(data, {
			keys: ["name", "japaneseName", "VA", "japaneseVA"],
		});
	}, [data]);

	const [query, setQuery] = useState("");

	// biome-ignore lint/correctness/useExhaustiveDependencies: No need
	const result: CharacterData[] = useMemo(() => {
		if (!fuse) return [];
		if (!query.trim()) return data;
		return fuse.search(query).map(({ item }) => item);
	}, [fuse, query]);

	return (
		<div className="max-w-[1024px] w-full h-full flex flex-col p-5 gap-5 mx-auto overflow-auto">
			<div className="font-bold text-xl text-primary-6">
				THE iDOLM@STER Characters List
			</div>
			<div className="w-full flex items-center justify-between gap-5 flex-wrap md:flex-row flex-col">
				<div className="md:w-auto w-full flex-1">
					<Input
						variant="custom"
						placeholder="Search Characters..."
						onInput={debounce((inputObject: HTMLTextAreaElement) => {
							setQuery(inputObject.value);
						})}
						className="flex flex-1 p-3 bg-base border border-surface-1 rounded-md text-text"
					/>
				</div>
			</div>
			<div className="w-full grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-2.5">
				{result?.map((characterData) => (
					<Idol
						charInfo={characterData}
						key={characterData.id}
						popupRefList={popupRefList}
						cardRefList={cardRefList}
						setShowPopup={setShowPopup}
						setIdolInfo={setIdolInfo}
					/>
				))}
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
