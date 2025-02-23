import { MessageCircle } from "lucide-react";

export default function PostSkeleton() {
	return (
		<div className="w-full p-5 bg-primary-3 rounded-lg flex flex-col gap-5">
			<div className="flex-1 flex items-center gap-2.5">
				<div className="rounded-full w-10 h-10 skeleton" />
				<div className="flex flex-col gap-1">
					<div className="font-bold w-40 h-[1em] skeleton rounded-md" />
					<div className="text-sm text-primary-5 w-10 h-[0.875em] skeleton rounded-md" />
				</div>
			</div>
			<div className="w-full h-[1em] skeleton rounded-md" />
			<div className="relative w-full h-96 rounded-xl skeleton" />
			<div className="w-full flex items-center justify-between">
				<div className="text-primary-5 w-40 h-[1em] skeleton rounded-md" />
				<div className="flex gap-2.5 items-center text-primary-5">
					<MessageCircle />
					<div className="aspect-square h-[1em] skeleton rounded-md" />
				</div>
			</div>
		</div>
	);
}
