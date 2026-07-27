import axios from "axios";
import NotFound from "~/routes/components/NotFound";
import type { LiveArchiveDto, LiveEventDto } from "~/services/live.services";
import type { Route } from "./+types/player";
import PlayerPage from "./components/PlayerPage";

export async function loader({ params }: Route.LoaderArgs) {
	try {
		const { data: eventData } = await axios.get<LiveEventDto>(
			`${import.meta.env.VITE_BACKEND_API}/live/events/${params.slug}`,
		);
		const { data: archiveData } = await axios.get<LiveArchiveDto>(
			`${import.meta.env.VITE_BACKEND_API}/live/events/${params.slug}/archives/${params.broadcast_id}`,
		);

		return {
			title:
				`${eventData.name} | ${archiveData.broadcast_name}` ||
				"<to be announced>",
			url: eventData.thumbnail || "https://cdn.tryz.id.vn/Live%20Image.png",
			eventData,
			archiveData,
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
		{ name: "description", content: "Archive | THE iDOLM@STER Vietnam Portal" },
		{ property: "og:title", content: title },
		{
			property: "og:description",
			content: "Archive | THE iDOLM@STER Vietnam Portal",
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
			content: "Archive | THE iDOLM@STER Vietnam Portal",
		},
		{
			name: "twitter:image",
			content: url,
		},
		{ property: "twitter:url", content: "https://jibunrest.art" },
		{ property: "twitter:domain", content: "jibunrest.art" },
	];
}

export default function Page({ loaderData }: Route.ComponentProps) {
	if (!loaderData.eventData || !loaderData.archiveData) {
		return <NotFound />;
	}

	return <PlayerPage loaderData={loaderData} />;
}
