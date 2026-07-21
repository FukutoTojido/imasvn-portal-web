import { memo } from "react";
import { Link } from "react-router";
import { Avatar, AvatarImage } from "~/components/ui/avatar";
import { buttonVariants } from "~/components/ui/button";
import {
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import type { Viewer } from "../types";

function Viewers({
	viewers,
	container,
}: {
	viewers: Viewer[];
	container?: HTMLElement;
}) {
	return (
		<DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="z-100">
			<DialogHeader>
				<DialogTitle>
					{viewers.length} Viewer{viewers.length > 1 ? "s" : ""}
				</DialogTitle>
				<DialogDescription>その目、だれの目？</DialogDescription>
			</DialogHeader>
			<div className="w-full grid grid-cols-2 gap-2.5 flex-1 overflow-auto">
				{viewers.map(({ username, id, displayName }) => {
					return (
						<Link
							to={`/users/${id}`}
							target="_blank"
							rel="noreferrer noopener nofollow"
							key={id}
							className={buttonVariants({
								variant: "ghost",
								className: "h-auto p-2 gap-2 justify-start",
							})}
						>
							<Avatar>
								<AvatarImage
									src={`${import.meta.env.VITE_BACKEND_API}/users/${id}/avatar`}
								/>
							</Avatar>
							<div className="flex flex-col">
								<span className="font-semibold">{displayName}</span>
								<span className="text-xs">@{username}</span>
							</div>
						</Link>
					);
				})}
			</div>
		</DialogContent>
	);
}

export default memo(Viewers);
