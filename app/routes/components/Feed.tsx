import InfiniteScroll from "~/lib/react-swr-infinite-scroll";
import useSWRInfinite from "swr/infinite";
import axios from "axios";
import PostSkeleton from "./PostSkeleton";
import type { PostData } from "~/types";
import Post from "./Post";

export default function Feed({
	url,
	indexedParam = "offset",
}: {
	url: string;
	indexedParam?: string;
}) {
	const swr = useSWRInfinite(
		(index) =>
			`${import.meta.env.VITE_BACKEND_API}${url}?${indexedParam}=${index + 1}`,
		async (key) => {
			const response = await axios.get(key);
			return response.data;
		},
	);

	return !swr.data?.[0].length ? (
		<div className="w-full h-[600px] border border-dashed border-surface-1 flex flex-col items-center justify-center text-subtext-0 rounded-md italic">
			"It's so empty here"
		</div>
	) : (
		<InfiniteScroll
			swr={swr}
			isReachingEnd={(swr) =>
				swr.data?.[0]?.length === 0 ||
				swr.data?.[swr.data?.length - 1]?.length < 5
			}
			loadingIndicator={
				<div className="flex-1 flex flex-col gap-2.5">
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			}
			endingIndicator=""
		>
			{(posts: PostData[]) => {
				return posts.map((postData) => (
					<Post data={postData} key={postData.id} revalidator={swr.mutate} />
				));
			}}
		</InfiniteScroll>
	);
}
