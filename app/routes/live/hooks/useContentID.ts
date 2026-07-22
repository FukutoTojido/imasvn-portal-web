import { useEffect, useState } from "react";
import type { LiveChannelDto } from "~/services/live.services";

export default function useContentID(
	data: LiveChannelDto | null,
	bearer: string | null,
) {
	const [url, setURL] = useState<string | null>(null);

	useEffect(() => {
		if (!data || !bearer) return;

		const { channel_id, url, stream_type } = data;
		if (url) {
			setURL(url);
			return;
		}

		const controller = new AbortController();

		const fetchBearer = async () => {
			const url = `${import.meta.env.VITE_SURVEY_URL}/${channel_id}/get_by_cuid?t=${Date.now()}`;

			try {
				const res = await fetch(url, {
					headers: {
						Authorization: `Bearer ${bearer}`,
					},
					signal: controller.signal,
				});

				if (!res.ok) {
					throw new Error("Cannot get URL from S");
				}

				const json = await res.json();
				setURL(
					stream_type === "dash"
						? json.ex_content.dash_streaming_url
						: json.ex_content.streaming_url,
				);
			} catch (error) {
				console.error(error);
				return;
			}
		};

		fetchBearer();

		return () => {
			controller.abort();
		};
	}, [data, bearer]);

	return url;
}
