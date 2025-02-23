import { Pen } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { show } from "~/slices/post";
import type store from "~/store";
import { UserType } from "~/types";

export default function RightBar() {
	const dispatch = useDispatch();
	const userData = useSelector(
		(state: ReturnType<typeof store.getState>) => state.auth.user,
	);

	return userData.authType === UserType.OK && userData.isJoinedServer ? (
		<div className="max-w-[300px] w-full h-min flex flex-col gap-2.5 self-start sticky top-[90px]">
			<button
				type="button"
				className="lg:relative fixed bottom-0 right-0 lg:m-0 m-4 lg:shadow-none shadow-[0_10px_10px_0_rgba(0,0,0,0.5)] flex gap-5 justify-center px-5 py-[15px] font-bold rounded-lg bg-primary-5 hover:bg-primary-4 text-primary-3"
				onClick={() => dispatch(show())}
			>
				<Pen />
				New post
			</button>
		</div>
	) : (
		""
	);
}
