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
}: {
	viewers: Viewer[];
}) {
	return (
		<DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="z-100 max-w-[calc(100%-2rem)]! w-300 max-h-[calc(100%-2rem)] overflow-auto">
			<DialogHeader>
				<DialogTitle>
					{viewers.length} Viewer{viewers.length > 1 ? "s" : ""}
				</DialogTitle>
				<DialogDescription>その目、だれの目？</DialogDescription>
			</DialogHeader>
			<div className="w-full grid md:grid-cols-4 grid-cols-2 gap-2.5 overflow-auto">
				{viewers.map(({ username, id, displayName }) => {
					return (
						<Link
							to={`/users/${id}`}
							target="_blank"
							rel="noreferrer noopener nofollow"
							key={id}
							className={buttonVariants({
								variant: "ghost",
								className: "h-auto p-2 gap-2 justify-start w-full overflow-hidden",
							})}
						>
							<Avatar>
								<AvatarImage
									src={`${import.meta.env.VITE_BACKEND_API}/users/${id}/avatar`}
								/>
							</Avatar>
							<div className="flex flex-col w-full overflow-hidden">
								<div className="font-semibold line-clamp-1 w-full whitespace-nowrap overflow-hidden text-ellipsis block">{displayName}</div>
								<div className="text-xs line-clamp-1 w-full whitespace-nowrap overflow-hidden text-ellipsis block">@{username}</div>
							</div>
						</Link>
					);
				})}
			</div>
		</DialogContent>
	);
}

export default memo(Viewers);
