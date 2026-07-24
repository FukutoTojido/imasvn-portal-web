import { useEffect, useState } from "react";

export const getReturnValue = (
	json: any,
	stream_type: "dash" | "hls" | "whep" | null,
	isLive: boolean,
) => {
	if (isLive) {
		return json.data.Channel.Custom_live_url;
	}

	return stream_type === "dash"
		? json.ex_content.dash_streaming_url
		: json.ex_content.streaming_url;
};

export default function useURL(
	contentID: string | null,
	bearer: string | null,
	type: "dash" | "hls" | "whep" | null,
	isLive = false,
) {
	const [url, setURL] = useState<string | null>(null);

	useEffect(() => {
		if (!contentID || !bearer || !type) return;

		const controller = new AbortController();

		const fetchBearer = async () => {
			if (contentID.includes("http")) return;

			const url = isLive
				? `${import.meta.env.VITE_EX_URL}/${contentID}?t=${Date.now()}`
				: `${import.meta.env.VITE_SURVEY_URL}/${contentID}/get_by_cuid?t=${Date.now()}`;

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

				setURL(getReturnValue(json, type, isLive));
			} catch (error) {
				console.error(error);
				return;
			}
		};

		fetchBearer();

		return () => {
			controller.abort();
		};
	}, [contentID, bearer, type, isLive]);

	return url;
}
