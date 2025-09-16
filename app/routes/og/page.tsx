import axios from "axios";
import FrontCardTemplate from "../admin/cards/components/FrontCardTemplate";
import type { Route } from "./+types/page";
import { safeJSONParse } from "../admin/cards/page";

export const config = { runtime: "edge" };

export const loader = async ({ params: { id } }: Route.LoaderArgs) => {
	const { ImageResponse } = await import("@vercel/og");

	const { data: cardData } = await axios.get(
		`${import.meta.env.VITE_BACKEND_API}/producer-id/_/cards/${id}`,
	);

	if (!cardData)
		return new Response("NOT_FOUND", {
			status: 404,
		});

	const baseNeueUrl = `${import.meta.env.VITE_BASE_URL}/fonts/BaseNeue-WideBlack.ttf`;
	const baseNeue2Url = `${import.meta.env.VITE_BASE_URL}/fonts/BaseNeue-SuperExpBold.ttf`;

	const [{ data: baseNeue }, { data: baseNeue2 }] = await Promise.all([
		axios.get(baseNeueUrl, {
			responseType: "arraybuffer",
		}),
		axios.get(baseNeue2Url, {
			responseType: "arraybuffer",
		}),
	]);

	return new ImageResponse(
		<FrontCardTemplate
			name={cardData.name}
			idol={cardData.idol}
			url={cardData.frontImg}
			config={safeJSONParse(cardData.config)}
		/>,
		{
			width: 590,
			height: 382,
			fonts: [
				{
					name: "Base Neue",
					data: baseNeue,
				},
				{
					name: "Base Neue 2",
					data: baseNeue2,
				},
			],
		},
	);
};
