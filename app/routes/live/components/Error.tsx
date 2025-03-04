import { Lock } from "lucide-react";

export default function ErrorComponent() {
	return (
		<div
			className="w-full h-full md:rounded-xl flex bg-no-repeat bg-cover bg-center overflow-hidden text-primary-6"
			style={{
				backgroundImage: "url(/riamungu.png)",
			}}
		>
			<div className="flex-1 bg-black/70 flex flex-col items-center justify-center gap-5 backdrop-blur-sm p-10">
				<Lock size={48} className="drop-shadow-md" />
				<span className="text-lg font-medium drop-shadow-md text-center">
					This content is only available
					<br />
					for <span className="font-bold">THE iDOLM@STER Vietnam Discord</span> members
				</span>
			</div>
		</div>
	);
}
