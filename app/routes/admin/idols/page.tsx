import axios from "axios";
import type { CharacterData } from "~/routes/calendar/types";

export const getCharacters = async () => {
	try {
		const { data } = await axios.get<CharacterData[]>(
			`${import.meta.env.VITE_BACKEND_API}/characters`,
		);
		return data;
	} catch (e) {
		console.error(e);
		return [];
	}
};