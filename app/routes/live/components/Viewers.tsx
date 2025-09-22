import { memo } from "react";
import { Link } from "react-router";
import { Avatar, AvatarImage } from "~/components/ui/avatar";
import {
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "~/components/ui/dialog";
import type { Viewer } from "../types";

function Viewers({ viewers, container }: { viewers: Viewer[], container?: HTMLElement }) {
	return (
		<DialogContent
			className="bg-base border-surface-1 text-text"
			onOpenAutoFocus={(e) => e.preventDefault()}
			container={container}
		>
			<div className="flex flex-col gap-2">
				<DialogTitle>{viewers.length} Viewer{viewers.length > 1 ? "s" : ""}</DialogTitle>
				<DialogDescription className="text-subtext-0">
					その目、だれの目？
				</DialogDescription>
			</div>
			<div className="w-full grid grid-cols-2 gap-2.5 flex-1 overflow-auto">
				{viewers.map(({ username, id, displayName }) => {
					return (
						<Link
							to={`/users/${id}`}
							target="_blank"
							rel="noreferrer noopener nofollow"
							key={id}
							className="text-sm w-full flex items-center gap-2.5 p-2.5 rounded-md hover:bg-surface-0 transition-all border border-transparent hover:border-surface-1"
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
