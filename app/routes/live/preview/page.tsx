import axios from "axios";
import type { Route } from "./+types/page";
import { useState } from "react";
import ErrorComponent from "~/routes/components/Error";
import { useSelector } from "react-redux";
import type store from "~/store";
import { UserType } from "~/types";
import type { Alert } from "../types";
import AlertMessage from "./components/Alert";

export async function loader() {
	try {
		const res = await axios.get(
			`${import.meta.env.VITE_BACKEND_API}/live/preview`,
		);
		return res.data;
	} catch (e) {
		console.error(e);
		return null;
	}
}

// biome-ignore lint/correctness/noEmptyPattern: <explanation>
export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Portal | THE iDOLM@STER Vietnam Portal" },
		{ name: "description", content: "" },
		{ property: "og:title", content: "Portal | THE iDOLM@STER Vietnam Portal" },
		{ property: "og:description", content: "" },
		{
			property: "og:image",
			content: "https://cdn.tryz.id.vn/Live%20Image.png",
		},
		{ property: "og:url", content: "https://live.tryz.id.vn" },
		{ name: "twitter:card", content: "summary_large_image" },
		{
			name: "twitter:title",
			content: "Portal | THE iDOLM@STER Vietnam Portal",
		},
		{
			name: "twitter:description",
			content: "",
		},
		{
			name: "twitter:image",
			content: "https://cdn.tryz.id.vn/Live%20Image.png",
		},
		{ property: "twitter:url", content: "https://live.tryz.id.vn" },
		{ property: "twitter:domain", content: "live.tryz.id.vn" },
	];
}

export default function Page({ loaderData }: Route.ComponentProps) {
	const me = useSelector(
		(state: ReturnType<typeof store.getState>) => state.auth.user,
	);

	const [url, setUrl] = useState<string>(loaderData?.url ?? "");
	const [alert, setAlert] = useState<Alert[]>([]);

	if (me.authType !== UserType.OK) return "";
	if (me.authType === UserType.OK && me.role !== 1) return <ErrorComponent />;
	if (loaderData === null) return <ErrorComponent />;

	async function submit(formData: FormData) {
		try {
			await axios.post(
				`${import.meta.env.VITE_BACKEND_API}/live/preview`,
				formData,
				{
					withCredentials: true,
				},
			);

			setAlert([
				...alert,
				{
					type: "OK",
					message: "Change preview successful",
					timestamp: Date.now(),
				},
			]);
		} catch (e) {
			console.error(e);
			setAlert([
				...alert,
				{
					type: "ERROR",
					message: "Error",
					timestamp: Date.now(),
				},
			]);
		}
	}

	return (
		<div className="w-5xl mx-auto max-w-full p-2.5 h-full">
			<form className="w-full flex flex-col gap-5" action={submit}>
				<div className="flex flex-col w-full gap-2.5">
					<label htmlFor="title" className="font-bold">
						Title
					</label>
					<input
						type="text"
						name="title"
						id="title"
						defaultValue={loaderData?.title}
						className="w-full bg-primary-3 p-2.5 rounded-lg focus-within:outline-2 outline-primary-6"
					/>
				</div>
				<div className="flex flex-col w-full gap-2.5">
					<label htmlFor="url" className="font-bold">
						Preview Image
					</label>
					<input
						type="text"
						name="url"
						id="url"
						defaultValue={url}
						className="w-full bg-primary-3 p-2.5 rounded-lg focus-within:outline-2 outline-primary-6"
						onChange={(event) => setUrl(event.target.value)}
					/>
					<img src={url} alt="" className="w-full object-cover rounded-xl" />
				</div>
				{alert.length === 0 ? (
					""
				) : (
					<div className="w-full flex-col flex gap-2.5">
						{alert.map((alertInfo, idx) => (
							<AlertMessage
								{...alertInfo}
								onRemove={() => {
									setAlert([...alert.slice(0, idx), ...alert.slice(idx + 1)]);
								}}
								key={alertInfo.timestamp}
							/>
						))}
					</div>
				)}
				<button
					type="submit"
					className="px-5 py-2.5 bg-primary-3 hover:bg-primary-4 rounded-xl w-max ml-auto"
				>
					Submit
				</button>
			</form>
		</div>
	);
}
