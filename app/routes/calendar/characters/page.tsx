import { useState } from "react";
import useIdolPopup from "../hooks/useIdolPopup";
import type { Route } from "./+types/page";
import useSWRInfinite from "swr/infinite";
import axios from "axios";
import InfiniteScroll from "~/lib/react-swr-infinite-scroll";
import Dialog from "../components/Dialog";
import Idol from "../components/Idol";
import Input from "~/routes/components/Input";
import type { CharacterData } from "../types";

// biome-ignore lint/correctness/noEmptyPattern: <explanation>
export function meta({}: Route.MetaArgs) {
    return [
        { title: "Characters | THE iDOLM@STER Vietnam Portal" },
        { name: "description", content: "THE iDOLM@STER Characters Lookup" },
        { property: "og:title", content: "Characters | THE iDOLM@STER Vietnam Portal" },
        { property: "og:description", content: "THE iDOLM@STER Characters Lookup" },
        { property: "og:image", content: "https://cdn.tryz.id.vn/fuyuping.png" },
        { property: "og:image:width", content: "400" },
        { property: "og:image:height", content: "400" },
        { property: "og:url", content: "https://live.tryz.id.vn" },
        { name: "twitter:title", content: "Characters | THE iDOLM@STER Vietnam Portal" },
        { name: "twitter:description", content: "THE iDOLM@STER Characters Lookup" },
        { name: "twitter:image", content: "https://cdn.tryz.id.vn/fuyuping.png" },
        { property: "twitter:url", content: "https://live.tryz.id.vn" },
        { property: "twitter:domain", content: "live.tryz.id.vn" },
    ];
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const debounce = (fn: (...agrs: any) => void, timeout = 300) => {
	let timer: string | number | NodeJS.Timeout | undefined;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
	const [query, setQuery] = useState("");

	const swr = useSWRInfinite(
		(index) =>
			`${import.meta.env.VITE_BACKEND_API}/characters?offset=${index + 1}&query=${query}`,
		async (key) => {
			const res = await axios.get(key);
			return res.data;
		},
	);

	return (
		<div className="max-w-[1024px] w-full h-full flex flex-col p-5 gap-8">
			<div className="w-full flex items-center justify-between gap-5 flex-wrap md:flex-row flex-col">
				<img
					src="/imasvn-logo.svg"
					alt="THE iDOLM@STER Vietnam Logo"
					width={230}
					height={50}
					className="h-auto"
					style={{
						objectFit: "contain",
					}}
				/>
				<div className="md:w-auto w-full flex-1">
					<Input
						variant="characters"
						placeholder="Search Characters..."
						onInput={debounce((inputObject: HTMLTextAreaElement) => {
							setQuery(inputObject.value);
						})}
					/>
				</div>
			</div>
			<div className="font-bold text-4xl text-alt-accent">Characters List</div>
			<div className="w-full grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-2.5">
				<InfiniteScroll
					swr={swr}
					isReachingEnd={(swr) =>
						swr.data?.[0]?.length === 0 ||
						swr.data?.[swr.data?.length - 1]?.length < 13
					}
					loadingIndicator={<Idol />}
					endingIndicator={<div className="hidden" />}
				>
					{(charsData: CharacterData[]) => {
						return charsData
							? charsData.map((charData) => (
									<Idol
										charInfo={charData}
										key={charData.Character}
										popupRefList={popupRefList}
										cardRefList={cardRefList}
										setShowPopup={setShowPopup}
										setIdolInfo={setIdolInfo}
									/>
								))
							: "";
					}}
				</InfiniteScroll>
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
