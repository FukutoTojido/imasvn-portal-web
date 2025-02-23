import { useSelector } from "react-redux";
import Feed from "../components/Feed";
import Composer from "./components/Composer";
import RightBar from "./components/RightBar";
import type store from "~/store";
import type { Route } from "./+types/page";

// biome-ignore lint/correctness/noEmptyPattern: <explanation>
export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Home | THE iDOLM@STER Vietnam Portal" },
		{ name: "description", content: "Welcome to THE iDOLM@STER Vietnam" },
		{ property: "og:title", content: "Home | THE iDOLM@STER Vietnam Portal" },
		{ property: "og:description", content: "Welcome to THE iDOLM@STER Vietnam" },
		{ property: "og:image", content: "https://cdn.tryz.id.vn/fuyuping.png" },
		{ property: "og:image:width", content: "400" },
		{ property: "og:image:height", content: "400" },
		{ property: "og:url", content: "https://live.tryz.id.vn" },
		{ name: "twitter:title", content: "Home | THE iDOLM@STER Vietnam Portal" },
		{ name: "twitter:description", content: "Welcome to THE iDOLM@STER Vietnam" },
		{ name: "twitter:image", content: "https://cdn.tryz.id.vn/fuyuping.png" },
		{ property: "twitter:url", content: "https://live.tryz.id.vn" },
		{ property: "twitter:domain", content: "live.tryz.id.vn" },
	];
}

export default function Page() {
	const postComposer = useSelector(
		(state: ReturnType<typeof store.getState>) => state.post.show,
	);

	return (
		<div className="w-full flex gap-2.5 flex-1 justify-center">
			<div className="relative flex-1 hidden items-end lg:flex flex-col" />
			<div className="w-[650px] max-w-full flex flex-col gap-2.5">
				<Feed url="/posts" />
			</div>
			<div className="flex-1 lg:relative absolute">
				<RightBar />
			</div>
			{postComposer ? <Composer /> : ""}
		</div>
	);
}
