import { useEffect, useState } from "react";

export default function useURL(
	contentID: string | null,
	bearer: string | null,
) {
	const [url, setURL] = useState<string | null>(null);

	useEffect(() => {
		if (!contentID || !bearer) return;

		const controller = new AbortController();

		const fetchBearer = async () => {
			if (contentID.includes("https")) return;

			const url = `${import.meta.env.VITE_SURVEY_URL}/${contentID}/get_by_cuid?t=${Date.now()}`;

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
				setURL(json.ex_content.dash_streaming_url);
			} catch (error) {
				console.error(error);
				return;
			}
		};

		fetchBearer();

		return () => {
			controller.abort();
		};
	}, [contentID, bearer]);

	return url;
}
