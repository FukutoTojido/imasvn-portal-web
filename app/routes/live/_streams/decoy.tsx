import axios from "axios";
import type { LiveEventDto } from "~/services/live.services";
import type { Route } from "./+types/decoy";

export async function loader({ params }: Route.LoaderArgs) {
	try {
		const { data: eventData } = await axios.get<LiveEventDto>(
			`${import.meta.env.VITE_BACKEND_API}/live/events/${params.slug}`,
		);

		return {
			title: `${eventData.name}` || "<to be announced>",
			url: eventData.thumbnail || "https://cdn.tryz.id.vn/Live%20Image.png",
			eventData,
		};
	} catch (e) {
		console.error(e);
		return {
			title: "Not found",
			url: "",
		};
	}
}

export function meta({ data: { title, url } }: Route.MetaArgs) {
	return [
		{ title },
		{ name: "description", content: "Live | THE iDOLM@STER Vietnam Portal" },
		{ property: "og:title", content: title },
		{
			property: "og:description",
			content: "Live | THE iDOLM@STER Vietnam Portal",
		},
		{
			property: "og:image",
			content: url,
		},
		{ property: "og:url", content: "https://jibunrest.art" },
		{ name: "twitter:card", content: "summary_large_image" },
		{
			name: "twitter:title",
			content: title,
		},
		{
			name: "twitter:description",
			content: "Live | THE iDOLM@STER Vietnam Portal",
		},
		{
			name: "twitter:image",
			content: url,
		},
		{ property: "twitter:url", content: "https://jibunrest.art" },
		{ property: "twitter:domain", content: "jibunrest.art" },
	];
}

export default function Page() {
	return (
		<div className="size-full flex flex-col items-center justify-center text-8xl font-bold">
			SIKE!
			<div className="text-base font-semibold">Go home, the live is over!</div>
		</div>
	);
}
