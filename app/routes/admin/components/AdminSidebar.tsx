import { Calendar1, ChevronUp, IdCard, User } from "lucide-react";
import { useDispatch } from "react-redux";
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
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	SidebarTrigger,
} from "~/components/ui/sidebar";
import { logOut } from "~/slices/auth";
import { type UserState, UserType } from "~/types";

export default function AdminSidebar({ me }: { me: UserState }) {
	const dispatch = useDispatch();
	return (
		<Sidebar
			className="bg-mantle border-surface-1 text-text h-full"
			collapsible="icon"
		>
			<SidebarHeader>
				<SidebarTrigger className="w-8 h-8 hover:bg-surface-1 hover:text-text" />
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel className="text-subtext-0">Menu</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									className="hover:bg-surface-1 hover:text-text"
								>
									<a href="/admin/producers">
										<IdCard />
										Producers
									</a>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									className="hover:bg-surface-1 hover:text-text"
								>
									<a href="/admin/events">
										<Calendar1 />
										Events
									</a>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupLabel className="text-subtext-0">
						Users
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									className="hover:bg-surface-1 hover:text-text"
								>
									<a href="/admin/users">
										<User />
										Users
									</a>
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
							<DropdownMenuTrigger
								asChild
								className="group-data-[collapsible=icon]:px-0! transition-all"
							>
								<SidebarMenuButton
									className="group-data-[collapsible=icon]:px-0 transition-all group-data-[collapsible=icon]:border-0 h-auto data-[state=open]:bg-surface-0 hover:bg-surface-0 hover:text-text focus-visible:ring-0 border border-surface-1 bg-base"
									tabIndex={-1}
								>
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
										<div className="text-xs text-subtext-0">
											@
											{me.authType === UserType.OK ? me.username : "Loading..."}
										</div>
									</div>
									<ChevronUp className="ml-auto" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								side="top"
								className="w-(--radix-dropdown-menu-trigger-width) bg-base text-text border-surface-1"
							>
								<DropdownMenuItem asChild>
									<SidebarMenuButton
										onClick={() => dispatch(logOut())}
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
