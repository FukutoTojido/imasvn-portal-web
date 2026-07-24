import { useEffect, useState } from "react";
import type { LiveArchiveDto, LiveChannelDto } from "~/services/live.services";
import { getReturnValue } from "./useURL";

export default function useContentID(
	data: LiveChannelDto | null,
	archiveData: LiveArchiveDto | null,
	bearer: string | null,
) {
	const [url, setURL] = useState<string | null>(null);

	useEffect(() => {
		if (!data || !archiveData || !bearer) return;

		const { channel_id, url, stream_type } = data;
		const { archive } = archiveData;
		
		if (url) {
			setURL(url);
			return;
		}

		const controller = new AbortController();

		const fetchBearer = async () => {
			const url = archive
				? `${import.meta.env.VITE_SURVEY_URL}/${channel_id}/get_by_cuid?t=${Date.now()}`
				: `${import.meta.env.VITE_EX_URL}/${channel_id}?embed=channel&t=${Date.now()}`;

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
					getReturnValue(json, stream_type ?? null, !archive)
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
	}, [data,archiveData, bearer]);

	return url;
}
