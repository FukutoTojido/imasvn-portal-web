import type { UserFlairData } from "~/types";
import { Link } from "react-router";

export default function UserFlair({
	data,
	showName = true,
	width = 30,
	height = 30,
	className = "",
}: {
	data?: UserFlairData;
	showName?: boolean;
	width?: number;
	height?: number;
	className?: string;
}) {
	if (!data) {
		if (showName)
			return (
				<div className="flex flex-col bg-primary-2 rounded-full post h-10 w-24 skeleton" />
			);

		return (
			<div className="flex flex-col bg-primary-2 rounded-full post h-10 w-10 skeleton aspect-square" />
		);
	}

	return (
		<Link to={`/users/${data.id}`} className={`w-max userFlair ${className}`}>
			<div
				className={`bg-transparent hover:bg-surface-1 flex items-center ${!showName ? "rounded-full p-1 hover:outline-2 outline-primary-5" : "rounded-md p-2"}`}
			>
				<img
					src={data.avatar}
					width={width}
					height={height}
					alt=""
					className="rounded-full"
				/>
				{showName && (
					<div className="flex flex-col justify-center px-2.5">
						<div className="text-sm font-bold text-text">{data.name}</div>
						<div className="text-xs text-subtext-1">@{data.tag}</div>
					</div>
				)}
			</div>
		</Link>
	);
}
