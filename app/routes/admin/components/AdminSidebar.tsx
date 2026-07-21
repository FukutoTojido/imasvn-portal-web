import axios from "axios";
import {
	Calendar1,
	ChevronUp,
	CreditCard,
	Film,
	IdCard,
	Link2,
	Sparkle,
	User,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { Link } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "~/components/ui/sidebar";
import { logOut } from "~/slices/auth";
import { type UserState, UserType } from "~/types";

export default function AdminSidebar({ me }: { me: UserState }) {
	const dispatch = useDispatch();
	return (
		<Sidebar className="h-full" collapsible="icon">
			<SidebarContent>
				<SidebarGroup>
					<Link to="/" viewTransition>
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
					</Link>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupLabel>Menu</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<Link to="/admin/producers" prefetch="render">
										<IdCard />
										Producers
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<Link to="/admin/cards" prefetch="render">
										<CreditCard />
										Cards
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<Link to="/admin/events" prefetch="render">
										<Calendar1 />
										Events
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<Link to="/admin/idols" prefetch="render">
										<Sparkle />
										Idols
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupLabel>Users</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<Link to="/admin/users" prefetch="render">
										<User />
										Users
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupLabel>Live</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<Link to="/admin/live/m3u8" prefetch="render">
										<Link2 />
										Streams
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupLabel>Contents</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<Link to="/admin/anime" prefetch="render">
										<Film />
										Anime
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton className="h-auto" tabIndex={-1}>
									<Avatar>
										<AvatarImage
											src={me.authType === UserType.OK ? me.avatar : ""}
										/>
										<AvatarFallback>Z</AvatarFallback>
									</Avatar>
									<div className="flex flex-col">
										{me.authType === UserType.OK
											? me.global_name
											: "Loading..."}
										<div className="text-xs">
											@
											{me.authType === UserType.OK ? me.username : "Loading..."}
										</div>
									</div>
									<ChevronUp className="ml-auto" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								side="top"
								className="w-(--radix-dropdown-menu-trigger-width)"
							>
								<DropdownMenuItem asChild>
									<SidebarMenuButton
										onClick={async () => {
											await axios.post(
												`${import.meta.env.VITE_BACKEND_API}/auth/logOut`,
												null,
												{ withCredentials: true },
											);
											dispatch(logOut());
										}}
										className="text-red"
									>
										Log Out
									</SidebarMenuButton>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
