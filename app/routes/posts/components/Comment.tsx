import { Ellipsis, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import Button from "~/routes/components/Button";
import { UserType, type Comment as CommentType } from "~/types";
import type store from "~/store";
import UserFlair from "~/routes/components/UserFlair";
import type { SWRInfiniteKeyedMutator } from "swr/infinite";
import axios from "axios";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";

export default function Comment({
	data,
	revalidator,
}: {
	data: CommentType;
	revalidator?: SWRInfiniteKeyedMutator<CommentType[]>;
}) {
	const popupRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
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
		<div className="w-full bg-base border border-surface-1 rounded-lg p-2.5 flex flex-col gap-[5px]">
			<div className="flex w-full justify-between items-center">
				<UserFlair data={data.user} />
				{currentUser.id === data.user.id ? (
					<Popover>
						<PopoverTrigger asChild>
							<button
								type="button"
								className="text-primary-6 relative p-2 hover:bg-primary-2 rounded-lg"
								onClick={toggleMenu}
								ref={buttonRef}
							>
								<Ellipsis />
							</button>
						</PopoverTrigger>
						<PopoverContent align="end" className="bg-base p-0 w-max min-w-[150px] border border-surface-1 overflow-hidden">
							<button
								type="button"
								className="w-full text-red relative p-4 hover:bg-surface-0 flex items-center gap-4"
								onClick={() => deletePost()}
							>
								<Trash2 size={16} />
								Delete
							</button>
						</PopoverContent>
					</Popover>
				) : (
					""
				)}
			</div>
			<span className="p-[5px] text-text">{data.content}</span>
		</div>
	);
}
