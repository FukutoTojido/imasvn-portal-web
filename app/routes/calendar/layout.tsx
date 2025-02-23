import { Outlet } from "react-router";

export default function Layout() {
	return (
		<div className="w-full min-h-screen flex flex-col items-center !bg-[#fff7f2]">
			<Outlet />
		</div>
	);
}
