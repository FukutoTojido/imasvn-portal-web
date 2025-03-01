import { Check, Trash, X } from "lucide-react";
import type { Alert } from "../../types";

export default function AlertMessage({
	type,
	message,
	onRemove,
}: Alert & { onRemove: () => void }) {
	if (type === "ERROR")
		return (
			<div className="w-full rounded-md p-2.5 flex gap-2.5 bg-[#ff817d] text-[#3b2423] font-bold items-center">
				<div className="p-2.5">
					<X strokeWidth={3} />
				</div>
				<span className="flex-1">{message}</span>
				<button
					type="button"
					onClick={() => onRemove()}
					className="p-2.5 rounded-md aspect-square hover:bg-white/50"
				>
					<Trash />
				</button>
			</div>
		);
	return (
		<div className="w-full rounded-md p-2.5 flex gap-2.5 bg-[#6cf5a7] text-[#284534] font-bold items-center">
			<div className="p-2.5">
				<Check strokeWidth={3} />
			</div>
			<span className="flex-1">{message}</span>
			<button
				type="button"
				onClick={() => onRemove()}
				className="p-2.5 rounded-md aspect-square hover:bg-white/50"
			>
				<Trash />
			</button>
		</div>
	);
}
