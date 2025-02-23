import { Ellipsis, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import Button from "~/routes/components/Button";
import { UserType, type Comment as CommentType } from "~/types";
import type store from "~/store";
import UserFlair from "~/routes/components/UserFlair";
import type { SWRInfiniteKeyedMutator } from "swr/infinite";
import axios from "axios";

export default function Comment({
	data,
	revalidator,
}: {
	data: CommentType;
	revalidator?: SWRInfiniteKeyedMutator<CommentType[]>;
}) {
	const popupRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLDivElement>(null);
	const [showMenu, setShowMenu] = useState<boolean>(false);

	const currentUser = useSelector(
		(state: ReturnType<typeof store.getState>) => state.auth.user,
	);

	const handlePopup = (event: MouseEvent) => {
		if (
			popupRef.current?.contains(event.target as Node) ||
			buttonRef.current?.contains(event.target as Node)
		) {
			return;
		}

		setShowMenu(false);
	};

	const toggleMenu = () => {
		setShowMenu(!showMenu);
	};

	const deletePost = async () => {
		try {
			await axios.delete(
				`${import.meta.env.VITE_BACKEND_API}/posts/${data.postId}/comments/${data.id}`,
				{
					withCredentials: true,
				},
			);
			revalidator?.();
		} catch (e) {
			console.error(e);
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		document.addEventListener("click", handlePopup);
	}, []);

	if (currentUser.authType !== UserType.OK) return "";

	return (
		<div className="w-full bg-primary-2 rounded-lg p-2.5 flex flex-col gap-[5px]">
			<div className="flex w-full justify-between items-center">
				<UserFlair data={data.user} />
				{currentUser.id === data.user.id ? (
					<div className="relative" ref={buttonRef}>
						<button
							type="button"
							className="text-primary-6 relative p-2 hover:bg-primary-2 rounded-lg"
							onClick={toggleMenu}
						>
							<Ellipsis />
						</button>
						<div
							className="absolute top-[100%] right-0 flex flex-col p-2 gap-2.5 bg-primary-2 rounded-xl mt-1 drop-shadow-md z-50"
							style={{
								display: showMenu ? "block" : "none",
							}}
							ref={popupRef}
						>
							<Button
								icon={<Trash2 />}
								name="Delete"
								variant="danger_menu"
								onClick={() => deletePost()}
							/>
						</div>
					</div>
				) : (
					""
				)}
			</div>
			<span className="p-[5px] text-white">{data.content}</span>
		</div>
	);
}
