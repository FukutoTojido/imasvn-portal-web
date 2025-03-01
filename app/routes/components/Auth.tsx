import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "~/slices/auth";
import { UserType } from "~/types";

export default function Auth({
	user,
	children,
}: {
	children: React.ReactNode;
	user: {
		id: string;
		name: string;
		tag: string;
		avatar: string;
		banner: string;
		isJoinedServer: boolean;
		role: number
	};
}) {
	const dispatch = useDispatch();

	useEffect(() => {
		if (!user) {
			dispatch(
				setUser({
					authType: UserType.NULL,
				}),
			);
			return;
		}

		dispatch(
			setUser({
				global_name: user.name,
				id: user.id,
				username: user.tag,
				avatar: user.avatar,
				banner: user.banner,
				isJoinedServer: user.isJoinedServer,
				authType: UserType.OK,
				role: user.role
			}),
		);
	}, [
		user?.name,
		user?.id,
		user?.tag,
		user?.avatar,
		user?.banner,
		user?.isJoinedServer,
		user,
		dispatch,
	]);

	return <>{children}</>;
}
