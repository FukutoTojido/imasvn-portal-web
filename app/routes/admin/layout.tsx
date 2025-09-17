import { useSelector } from "react-redux";
import { Outlet } from "react-router";
import { Toaster } from "sonner";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import ErrorComponent from "~/routes/components/Error";
import type store from "~/store";
import { UserType } from "~/types";
import AdminSidebar from "./components/AdminSidebar";

export default function Page() {
	const me = useSelector(
		(state: ReturnType<typeof store.getState>) => state.auth.user,
	);

	if (me.authType !== UserType.OK) return "";
	if (me.authType === UserType.OK && me.role !== 1) return <ErrorComponent />;

	return (
		<SidebarProvider>
			<div className="w-screen h-screen flex bg-crust font-rubik text-text gridLoop">
				<AdminSidebar me={me} />
				<div className="max-w-full flex-1 flex flex-col items-center p-5 overflow-auto">
					<SidebarTrigger className="w-8 h-8 hover:bg-surface-1 hover:text-text self-start" />
					<div className="w-[1200px] max-w-full flex flex-col gap-5 py-10">
						<Outlet />
						<Toaster className="absolute" />
					</div>
				</div>
			</div>
		</SidebarProvider>
	);
}
