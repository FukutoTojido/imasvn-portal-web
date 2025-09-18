import axios, { type AxiosError, CanceledError } from "axios";
import { Outlet } from "react-router";
import Store from "~/routes/components/Store";
import type { Route } from "./+types/layout";
import Auth from "./components/Auth";

export function meta() {
	return [
		{ title: "Portal | THE iDOLM@STER Vietnam Portal" },
		{ name: "description", content: "Welcome to THE iDOLM@STER Vietnam" },
		{ property: "og:title", content: "Portal | THE iDOLM@STER Vietnam Portal" },
		{
			property: "og:description",
			content: "Welcome to THE iDOLM@STER Vietnam",
		},
		{
			property: "og:image",
			content: "https://cdn.tryz.id.vn/Portal%20Image.png",
		},
		{ property: "og:url", content: "https://live.tryz.id.vn" },
		{ name: "twitter:card", content: "summary_large_image" },
		{
			name: "twitter:title",
			content: "Portal | THE iDOLM@STER Vietnam Portal",
		},
		{
			name: "twitter:description",
			content: "Welcome to THE iDOLM@STER Vietnam",
		},
		{
			name: "twitter:image",
			content: "https://cdn.tryz.id.vn/Portal%20Image.png",
		},
		{ property: "twitter:url", content: "https://live.tryz.id.vn" },
		{ property: "twitter:domain", content: "live.tryz.id.vn" },
	];
}

export async function clientLoader() {
	try {
		await axios.post(`${import.meta.env.VITE_BACKEND_API}/auth/refresh`, null, {
			withCredentials: true,
		});

		const result = (
			await axios.get(`${import.meta.env.VITE_BACKEND_API}/auth/@me`, {
				withCredentials: true,
			})
		).data;

		return result;
	} catch (e) {
		if (e instanceof CanceledError) return null;
		console.error((e as AxiosError).toJSON());
		return null;
	}
}

export default function Layout({ loaderData }: Route.ComponentProps) {
	const user = loaderData;

	return (
		<Store>
			<Auth user={user}>
				<Outlet />
			</Auth>
		</Store>
	);
}
