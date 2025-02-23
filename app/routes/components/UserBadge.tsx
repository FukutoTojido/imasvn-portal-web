import { useSelector } from "react-redux";
import { Link } from "react-router";
import { UserType, type UserState } from "~/types";
import type store from "~/store";


export default function UserBadge() {
	const userData = useSelector(
		(state: ReturnType<typeof store.getState>) => state.auth.user,
	);

	if (userData.authType === UserType.NULL) {
		return (
			<Link to="/login">
				<div className="p-2.5 px-4 flex gap-2.5 bg-primary-3 hover:bg-primary-2 rounded-lg items-center cursor-pointer">
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
						<div className="font-bold text-primary-6 text-sm">
							Login with Discord
						</div>
					</div>
				</div>
			</Link>
		);
	}

	if (userData.authType !== UserType.OK) {
		return (
			<div className=" p-2.5 px-4 flex gap-4 bg-primary-3 hover:outline-2 outline-0 outline-primary-5 rounded-lg items-center cursor-pointer">
				<div className="aspect-square h-[30px] rounded-full overflow-hidden relative ring-2 ring-offset-2 ring-primary-5 ring-offset-primary-3 skeleton" />
				<div className="flex flex-col gap-2">
					<div className="font-bold text-primary-6 text-sm skeleton h-4 w-20 rounded-md" />
					<div className="text-primary-5 text-xs skeleton h-2 w-20 rounded-md" />
				</div>
			</div>
		);
	}

	return (
		<Link to={`/users/${userData.id}`}>
			<div className=" p-2.5 px-4 flex gap-4 bg-primary-3 hover:bg-primary-2 transition-all rounded-lg items-center cursor-pointer">
				<div className="aspect-square h-[30px] rounded-full overflow-hidden relative ring-2 ring-offset-2 ring-primary-5 ring-offset-primary-3">
					<img
						src={userData.avatar}
						alt=""
						sizes="100%"
						className="object-cover"
					/>
				</div>
				<div className="flex-col items-start md:flex hidden">
					<div className="font-bold text-primary-6 text-sm">
						{userData.global_name}
					</div>
					<div className="text-primary-5 text-xs">@{userData.username}</div>
				</div>
			</div>
		</Link>
	);
}
