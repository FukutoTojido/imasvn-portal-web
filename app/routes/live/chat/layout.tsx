import { Outlet } from "react-router";
import "../Live.css";

export default function Layout() {
	return (
		<>
			<div className="bg-crust w-full flex flex-col flex-1 gap-5 overflow-hidden live">
				<Outlet />
			</div>
		</>
	);
}
