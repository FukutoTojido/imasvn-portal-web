import { memo } from "react";
import type { Viewer } from "../types";
import { X } from "lucide-react";

function Viewers({
	viewers,
}: {
	viewers: Viewer[];
}) {
	return (
		<div
			// @ts-ignore
			popover="auto"
			id="viewers"
			className="bg-primary-3 p-5 rounded-lg absolute inset-0 m-auto w-[400px] max-w-[100%] h-[500px] max-h-[100%] shadow-2xl shadow-black/80 flex-col gap-5 text-primary-6"
		>
			<div className="w-full flex items-center font-bold">
				Viewers
				<button
					type="button"
					/* @ts-ignore */
					popoverTarget="viewers"
					className="ml-auto"
				>
					<X />
				</button>
			</div>
			<div className="flex flex-col w-full gap-2.5 flex-1 overflow-auto">
				{viewers.map(({ username, id }) => {
					return (
						<div key={id} className="text-sm w-full flex items-center gap-2.5">
							<img
								src={`${import.meta.env.VITE_BACKEND_API}/users/${id}/avatar`}
								alt=""
								width={20}
								height={20}
								className="w-5 h-5 rounded-full object-cover object-center"
							/>{" "}
							{username}
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default memo(Viewers);
