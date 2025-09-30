import { useSelector } from "react-redux";
import { Outlet } from "react-router";
import ErrorComponent from "~/routes/components/Error";
import type store from "~/store";
import { UserType } from "~/types";
import NavBar from "../components/NavBar";

export default function Page() {
	const me = useSelector(
		(state: ReturnType<typeof store.getState>) => state.auth.user,
	);

	if (me.authType !== UserType.OK) return "";
	if (me.authType === UserType.OK && !me.isJoinedServer) return <ErrorComponent />;

	return (
		<>
			<NavBar />
			<Outlet />
		</>
	);
}
