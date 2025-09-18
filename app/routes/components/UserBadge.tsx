import axios from "axios";
import { LogOut, User2 } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";
import { logOut } from "~/slices/auth";
import type store from "~/store";
import { UserType } from "~/types";

export default function UserBadge() {
	const userData = useSelector(
		(state: ReturnType<typeof store.getState>) => state.auth.user,
	);

	const [popOpen, setPopOpen] = useState(false);
	const dispatch = useDispatch();

	if (userData.authType === UserType.NULL) {
		return (
			<Link to="/login">
				<div className="p-2.5 px-4 flex gap-2.5 bg-transparent hover:bg-surface-0 rounded-md items-center cursor-pointer">
					<div className="relative">
						<img
							src="/discord.svg"
							width={20}
							height={0}
							alt=""
							sizes="100%"
							className="object-cover"
						/>
					</div>
					<div className="flex flex-col">
						<div className="font-bold text-primary-6 text-sm">Login</div>
					</div>
				</div>
			</Link>
		);
	}

	if (userData.authType !== UserType.OK) {
		return (
			<div className=" p-2.5 px-4 flex gap-4 bg-primary-3 hover:outline-2 outline-0 outline-primary-5 rounded-md items-center cursor-pointer">
				<div className="aspect-square h-[30px] rounded-full overflow-hidden relative ring-2 ring-offset-2 ring-primary-5 ring-offset-primary-3 skeleton" />
				<div className="flex flex-col gap-2">
					<div className="font-bold text-primary-6 text-sm skeleton h-4 w-20 rounded-md" />
					<div className="text-primary-5 text-xs skeleton h-2 w-20 rounded-md" />
				</div>
			</div>
		);
	}

	return (
		<Popover open={popOpen} onOpenChange={setPopOpen}>
			<PopoverTrigger asChild>
				<div className=" p-2.5 px-4 flex gap-4 hover:bg-surface-0 transition-all rounded-lg items-center cursor-pointer">
					<div className="aspect-square h-[30px] rounded-full overflow-hidden relative ring-2 ring-offset-2 ring-text ring-offset-base">
						<img
							src={userData.avatar}
							alt=""
							sizes="100%"
							className="object-cover"
						/>
					</div>
					<div className="flex-col items-start md:flex hidden">
						<div className="font-bold text-text text-sm">
							{userData.global_name}
						</div>
						<div className="text-subtext-1 text-xs">@{userData.username}</div>
					</div>
				</div>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				className="bg-base border-surface-1 overflow-hidden p-0 w-max min-w-[200px] text-text"
			>
				<Link
					to={`/users/${userData.id}`}
					className="w-full hover:bg-surface-0 flex items-center p-3 px-5 gap-3 border-surface-1 border-b"
					onClick={() => setPopOpen(false)}
					viewTransition
				>
					<User2 size={16} />
					Profile
				</Link>
				<button
					className="w-full hover:bg-surface-0 flex items-center p-3 px-5 gap-3 text-red"
					type="button"
					onClick={async () => {
						setPopOpen(false);
						await axios.post(
							`${import.meta.env.VITE_BACKEND_API}/auth/logOut`,
							null,
							{ withCredentials: true },
						);
						dispatch(logOut());
					}}
				>
					<LogOut size={16} />
					Logout
				</button>
			</PopoverContent>
		</Popover>
	);
}
