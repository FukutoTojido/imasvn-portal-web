import axios, { type AxiosError } from "axios";
import type { Route } from "./+types/page";
import { ChevronLeft } from "lucide-react";
import { Link, useNavigate } from "react-router";
import Button from "../components/Button";
import Post from "../components/Post";
import CommentsFeed from "./components/CommentsFeed";
import NotFound from "../components/NotFound";

export async function loader({ params }: Route.LoaderArgs) {
	try {
		const postData = await axios.get(
			`${import.meta.env.VITE_BACKEND_API}/posts/${params.id}`,
		);

		return postData.data;
	} catch (e) {
		console.error((e as AxiosError).toJSON());
		return null;
	}
}

export default function Page({ loaderData }: Route.ComponentProps) {
	const postData = loaderData;
	const navigate = useNavigate();

	if (!postData) return <NotFound />;

	return (
		<div className="w-full flex md:gap-2.5 flex-1 md:flex-row flex-col">
			<div className="md:flex-1 md:flex md:justify-end justify-start md:px-0 px-5 h-min hidden">
				<div>
					<Button
						variant="outlined"
						icon={<ChevronLeft />}
						onClick={() => navigate(-1)}
					/>
				</div>
			</div>
			<div className="md:w-[650px] w-full flex flex-col gap-2.5">
				<div className="w-full flex flex-col bg-primary-3 rounded-lg">
					<Post data={postData} redirect={false} />
				</div>
				<div className="w-full h-min bg-base border border-surface-1 md:rounded-lg p-5 flex flex-col gap-2.5 top-0 sticky">
					<div className="font-bold text-text">Comments</div>
					<CommentsFeed
						postData={postData}
						url={`${import.meta.env.VITE_BACKEND_API}/posts/${postData.id}/comments`}
					/>
				</div>
			</div>
			<div className="flex-1" />
		</div>
	);
}
