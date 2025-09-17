import { AtSign, Calendar, User, Video } from "lucide-react";
import { Link, useLocation } from "react-router";
import UserBadge from "./UserBadge";

export default function NavBar() {
	const routes = [
		// {
		//     alias: ["/"],
		//     href: "/",
		//     name: "Home",
		//     icon: <Home />,
		// },
		{
			alias: ["/", "/blog", "/compose", "/posts"],
			href: "/",
			name: "Feeds",
			icon: <AtSign size={16} />,
		},
		{
			alias: ["/live"],
			href: "/live",
			name: "Live",
			icon: <Video size={16} />,
		},
		{
			alias: ["/calendar"],
			href: "/calendar",
			name: "Calendar",
			icon: <Calendar size={16} />,
		},
		{
			alias: ["/characters"],
			href: "/characters",
			name: "Characters",
			icon: <User size={16} />,
		},
		// {
		//     alias: ["/anime"],
		//     href: "/anime",
		//     name: "Anime",
		//     icon: <Film />,
		// },
		// {
		//     alias: ["/manga"],
		//     href: "/manga",
		//     name: "Manga",
		//     icon: <Book />,
		// },
	];

	const pathname = `/${useLocation().pathname.split("/").at(1)}`;

	return (
		<div className="sticky top-0 self-start w-full h-[80px] flex gap-5 md:items-center overflow-hidden md:overflow-visible p-2.5 md:px-5 md:flex-row flex-col bg-base border-b-surface-1 border-b-1 z-50">
			<img
				src="/imasvn.png"
				alt="THE iDOLM@STER Vietnam Logo"
				width={230}
				height={50}
				className="md:block hidden h-auto"
				style={{
					objectFit: "contain",
				}}
			/>
			<div className="flex-1 flex items-center gap-2.5">
				{routes.map(({ alias, href, name, icon }) => (
					<Link to={href} key={href}>
						<div
							className={`relative h-full p-4 flex gap-5 items-center rounded-md hover:bg-mantle opacity-50 hover:opacity-100 transition nav text-text ${
								alias.includes(pathname) ? "bg-surface-0 opacity-100 border border-surface-1 navHighlighted" : "bg-transparent"
							}`}
						>
							{icon}
							<span className="md:block hidden text-xs">{name}</span>
						</div>
					</Link>
				))}
				<div className="ml-auto">
					<UserBadge />
				</div>
			</div>
		</div>
	);
}
