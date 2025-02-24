import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router";
import type store from "~/store";
import { UserType } from "~/types";

export default function Layout() {
	const me = useSelector(
		(state: ReturnType<typeof store.getState>) => state.auth.user,
	);
	const navigate = useNavigate();

	useEffect(() => {
		if (me.authType === UserType.OK) navigate("/");
	}, [me.authType, navigate]);

	if (me.authType === UserType.OK) return <></>;
	return (
		<div
			className="w-full md:h-full flex flex-col flex-1 gap-5 md:p-2.5 overflow-hidden md:items-start items-center justify-center p-4 md:px-96"
			style={{
				backgroundImage:
					"url(https://cdn.tryz.id.vn/anime-girl-car-drinking-coffee-co.jpg)",
				backgroundSize: "cover",
				backgroundPosition: "center",
			}}
		>
			<Outlet />
		</div>
	);
}
