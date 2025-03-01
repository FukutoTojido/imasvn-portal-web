import { Outlet } from "react-router";
import NavBar from "../components/NavBar";
import "./Live.css";

export default function Layout() {
	return (
		<>
			<NavBar />
			<div className="w-full flex flex-col flex-1 gap-5 md:p-2.5 overflow-hidden live">
				<Outlet />
			</div>
		</>
	);
}