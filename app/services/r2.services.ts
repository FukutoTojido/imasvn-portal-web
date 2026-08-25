import axios from "axios";

export async function getPresignedUrls(keys: string[]) {
	try {
		const { data } = await axios.post(
			`${import.meta.env.VITE_BACKEND_API}/presigned`,
			{ keys },
			{
				withCredentials: true,
			},
		);

		return data;
	} catch (e) {
		console.error(e);
		return null;
	}
}
