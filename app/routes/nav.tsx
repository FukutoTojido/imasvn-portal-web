import { Outlet } from "react-router";
import NavBar from "./components/NavBar";
import ImageViewer from "./components/ImageViewer";

export default function Layout() {
	return (
		<>
			<NavBar />
			<div className="w-full md:h-full flex flex-col flex-1 gap-5 md:p-2.5">
				<Outlet />
			</div>
			<ImageViewer />
		</>
	);
}
