import { useEffect, useState } from "react";

export default function useBearer() {
	const [bearer, setBearer] = useState<string | null>(null);

	useEffect(() => {
		const controller = new AbortController();

		const fetchBearer = async () => {
			const url = `${import.meta.env.VITE_TOKEN_URL}?t=${Date.now()}`;

			try {
				const res = await fetch(url, {
					signal: controller.signal,
					credentials: "include",
				});

				if (!res.ok) {
					throw new Error("Cannot get token from A");
				}

				const token = await res.text();
				setBearer(token);
			} catch (error) {
				console.error(error);
				return;
			}
		};

		fetchBearer();

		return () => {
			controller.abort();
		};
	}, []);

	return bearer;
}
