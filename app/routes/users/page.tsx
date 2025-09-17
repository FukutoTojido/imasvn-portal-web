import axios, { type AxiosError } from "axios";
import Feed from "../components/Feed";
import NotFound from "../components/NotFound";
import OpenImage from "../components/OpenImage";
import type { Route } from "./+types/page";
import type { Card } from "../admin/types";
import type { EventData } from "../admin/components/UpdateEvent";
import { Link } from "react-router";

export async function loader({ params }: Route.LoaderArgs) {
	try {
		const { data: userData } = await axios.get(
			`${import.meta.env.VITE_BACKEND_API}/users/${params.id}`,
		);

		if (!userData.pid) return { userData };

		const [{ data: producerData }, { data: cards }] = await Promise.all([
			axios.get(
				`${import.meta.env.VITE_BACKEND_API}/producer-id/${userData.pid}`,
			),
			axios.get(
				`${import.meta.env.VITE_BACKEND_API}/producer-id/${userData.pid}/cards`,
			),
		]);

		return {
			userData,
			producerData,
			cards,
		};
	} catch (e) {
		console.error((e as AxiosError).toJSON());
		return null;
	}
}

export default function Page({ loaderData }: Route.ComponentProps) {
	if (!loaderData) return <NotFound />;

	const { userData, producerData, cards } = loaderData;

	return (
		<div className="max-w-full w-max flex gap-2.5 self-center sticky flex-col lg:flex-row">
			<div className="md:w-[550px] max-w-full w-full h-max flex flex-col items-center gap-2.5 lg:sticky top-[90px]">
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
				<div className="w-full flex flex-col gap-2.5 md:p-0 p-2.5">
					<span className="self-start md:pt-5 text-text font-bold">
						Producer IDs
					</span>
					<div className="w-full grid grid-cols-3 gap-2.5">
						{cards?.map((card: Card) => (
							<Link
								to={`${import.meta.env.VITE_BASE_URL}/producer-id/${card.id}`}
								target="_blank"
								key={card.id}
								className="p-5 w-full flex flex-col gap-5 items-center text-text bg-base border border-surface-1 rounded-md hover:bg-surface-0 cursor-pointer"
							>
								<div className="w-full aspect-square relative">
									<img
										src={card.img}
										alt=""
										className="absolute w-[80%] aspect-square top-0 right-0 rounded-lg"
									/>
									<img
										src={
											producerData?.events.find(
												(event: EventData) => event.id === (card.event ?? 0),
											).img
										}
										alt=""
										className="absolute w-[60%] aspect-square bottom-0 left-0 object-contain"
									/>
								</div>
								<div className="flex flex-col items-center">
									<span className="font-bold">{card.idolJapanese}</span>
									<span className="text-xs text-center line-clamp-1">
										{card.title}
									</span>
								</div>
							</Link>
						))}
					</div>
				</div>
			</div>
			<div className="md:w-[650px] max-w-full w-full flex-1 flex flex-col gap-5">
				<div className="flex flex-col gap-2.5">
					<Feed url={`/users/${userData.id}/posts`} />
				</div>
			</div>
		</div>
	);
}
