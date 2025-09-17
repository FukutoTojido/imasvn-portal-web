import axios from "axios";
import useSWRInfinite, { type SWRInfiniteKeyedMutator } from "swr/infinite";
import InfiniteScroll from "~/lib/react-swr-infinite-scroll";

import type { Comment as CommentType, PostData } from "~/types";
import Comment from "./Comment";
import { memo, useEffect, type Dispatch, type SetStateAction } from "react";
import CommentInput from "./CommentInput";

function Feed({
	postData,
	url,
}: {
	postData: PostData
	url: string;
}) {
	const swr = useSWRInfinite(
		(index) => `${url}?offset=${index + 1}`,
		async (key) => {
			const res = await axios.get(key);
			return res.data;
		},
	);
	return (
		<div className="flex flex-col gap-5">
			<CommentInput postData={postData} mutate={swr.mutate} />
			<InfiniteScroll
				swr={swr}
				isReachingEnd={(swr) =>
					swr.data?.[0]?.length === 0 ||
					swr.data?.[swr.data?.length - 1]?.length < 5
				}
				loadingIndicator={""}
			>
				{(comments: CommentType[]) =>
					comments.map((comment) => (
						<Comment data={comment} key={comment.id} revalidator={swr.mutate} />
					))
				}
			</InfiniteScroll>
		</div>
	);
}

const CommentsFeed = memo(Feed);
export default CommentsFeed;
