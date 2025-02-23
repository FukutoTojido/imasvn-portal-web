import { Outlet } from "react-router";

export default function Layout() {
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
