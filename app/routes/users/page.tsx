import axios, { type AxiosError } from "axios";
import { LogOut } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logOut } from "~/slices/auth";
import type store from "~/store";
import { UserType } from "~/types";
import Button from "../components/Button";
import Feed from "../components/Feed";
import NotFound from "../components/NotFound";
import OpenImage from "../components/OpenImage";
import type { Route } from "./+types/page";

export async function loader({ params }: Route.LoaderArgs) {
	try {
		const userData = await axios.get(
			`${import.meta.env.VITE_BACKEND_API}/users/${params.id}`,
		);

		return userData.data;
	} catch (e) {
		console.error((e as AxiosError).toJSON());
		return null;
	}
}

export default function Page({ loaderData }: Route.ComponentProps) {
	const userData = loaderData;

	if (!userData) return <NotFound />;

	return (
		<div className="w-full flex flex-col gap-5 items-center">
			<div className="md:w-[650px] w-full flex flex-col items-center gap-2.5 top-0">
				<div className="flex flex-col items-end justify-center md:rounded-md overflow-hidden p-0 w-full relative h-[300px] border border-surface-1">
					<div className="relative w-full flex-1 overflow-hidden bg-black/20">
						{userData.banner === "" ? (
							""
						) : (
							<OpenImage imageSet={[{ url: `${userData.banner}?size=600` }]}>
								<img
									src={`${userData.banner}?size=600`}
									alt=""
									sizes="100vw"
									className="object-cover object-center w-full"
								/>
							</OpenImage>
						)}
					</div>
					<div className="relative flex gap-10 items-end justify-start h-[100px] p-5 w-full bg-base">
						<div className="w-[150px] aspect-square rounded-full overflow-hidden relative border-4 border-base">
							{userData.avatar === "" ? (
								""
							) : (
								<OpenImage imageSet={[{ url: `${userData.avatar}?size=240` }]}>
									<img
										src={`${userData.avatar}?size=240`}
										alt=""
										className="object-cover"
									/>
								</OpenImage>
							)}
						</div>
						<div className="flex flex-col gap-2 items-start h-full justify-start">
							<div className="flex flex-col items-start relative text-text">
								<div className="text-2xl font-bold">{userData.name}</div>
								<div className="text-sm">@{userData.tag}</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="md:w-[650px] w-full flex-1 flex flex-col gap-5">
				<div className="flex flex-col gap-2.5">
					<Feed url={`/users/${userData.id}/posts`} />
				</div>
			</div>
		</div>
	);
}
