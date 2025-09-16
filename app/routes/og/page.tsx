import { ImageResponse } from "@vercel/og";
import TakumiImageResponse from "@takumi-rs/image-response";
import axios from "axios";
import FrontCardTemplate from "../admin/cards/components/FrontCardTemplate";
import { safeJSONParse } from "../admin/cards/page";
import type { Route } from "./+types/page";
import FrontCardTemplate_ from "../admin/cards/components/FrontCardTemplate_";

export const config = { runtime: "edge" };

const baseNeueUrl = `${import.meta.env.VITE_BASE_URL}/fonts/BaseNeue-WideBlack.ttf`;
const baseNeue2Url = `${import.meta.env.VITE_BASE_URL}/fonts/BaseNeue-SuperExpBold.ttf`;
const baseNeueVUrl = `${import.meta.env.VITE_BASE_URL}/fonts/BaseNeue-Variable.ttf`;

const [{ data: baseNeue }, { data: baseNeue2 }, { data: baseNeueV }] =
	await Promise.all([
		axios.get(baseNeueUrl, {
			responseType: "arraybuffer",
		}),
		axios.get(baseNeue2Url, {
			responseType: "arraybuffer",
		}),
		axios.get(baseNeueVUrl, {
			responseType: "arraybuffer",
		}),
	]);

const fonts = [
	{
		name: "Base Neue",
		data: baseNeue,
	},
	{
		name: "Base Neue 2",
		data: baseNeue2,
	},
];

export const loader = async ({ params: { id }, request }: Route.LoaderArgs) => {
	const url = new URL(request.url);
	const takumi = url.searchParams.get("takumi");

	const { data: cardData } = await axios.get(
		`${import.meta.env.VITE_BACKEND_API}/producer-id/_/cards/${id}`,
	);

	if (!cardData)
		return new Response("NOT_FOUND", {
			status: 404,
		});

	return takumi
		? new TakumiImageResponse(
				<FrontCardTemplate_
					name={cardData.name}
					idol={cardData.idol}
					url={cardData.frontImg}
					config={safeJSONParse(cardData.config)}
				/>,
				{
					width: 590,
					height: 382,
					fonts: [
						...fonts,
						{
							name: "Base Neue V",
							data: baseNeueV,
						},
					],
				},
			)
		: new ImageResponse(
				<FrontCardTemplate
					name={cardData.name}
					idol={cardData.idol}
					url={cardData.frontImg}
					config={safeJSONParse(cardData.config)}
				/>,
				{
					width: 590,
					height: 382,
					fonts,
				},
			);
};
