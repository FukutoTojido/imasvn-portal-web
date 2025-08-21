import { useSelector } from "react-redux";
import { Outlet } from "react-router";
import { Toaster } from "sonner";
import ErrorComponent from "~/routes/components/Error";
import type store from "~/store";
import { UserType } from "~/types";

export default function Page() {
	const me = useSelector(
		(state: ReturnType<typeof store.getState>) => state.auth.user,
	);

	if (me.authType !== UserType.OK) return "";
	if (me.authType === UserType.OK && me.role !== 1) return <ErrorComponent />;

	return (
		<div className="w-screen h-screen p-5 py-10 flex flex-col items-center bg-crust font-rubik text-text gridLoop">
			<div className="max-w-full w-[1200px] flex flex-col gap-5">
				<Toaster/>
				<Outlet />
			</div>
		</div>
	);
}
