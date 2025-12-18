import type { Route } from "./+types/page";

// biome-ignore lint/correctness/noEmptyPattern: <explanation>
export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Login | THE iDOLM@STER Vietnam Portal" },
		{
			name: "description",
			content: "Please login to fully access THE iDOLM@STER Vietnam",
		},
		{ property: "og:title", content: "Login | THE iDOLM@STER Vietnam Portal" },
		{
			property: "og:description",
			content: "Please login to fully access THE iDOLM@STER Vietnam",
		},
		{
			property: "og:image",
			content: "https://cdn.tryz.id.vn/Portal%20Image.png",
		},
		{ property: "og:url", content: "https://jibunrest.art" },
		{ name: "twitter:card", content: "summary_large_image" },
		{
			name: "twitter:title",
			content: "Login | THE iDOLM@STER Vietnam Portal",
		},
		{
			name: "twitter:description",
			content: "Please login to fully access THE iDOLM@STER Vietnam",
		},
		{
			name: "twitter:image",
			content: "https://cdn.tryz.id.vn/Portal%20Image.png",
		},
		{ property: "twitter:url", content: "https://jibunrest.art" },
		{ property: "twitter:domain", content: "jibunrest.art" },
	];
}

export default function Page() {
	return (
		<div className="flex flex-col items-center justify-center gap-5 md:w-max max-w-full p-5 bg-primary-1 rounded-xl shadow-[0_5px_20px_0_rgba(0,0,0,0.4)]">
			<img
				src="/imasvn.png"
				alt="THE iDOLM@STER Vietnam Logo"
				width={350}
				height={10}
				className="h-auto"
				style={{
					objectFit: "contain",
				}}
			/>
			<div className="flex flex-col gap-2.5 w-full">
				<a href={`${import.meta.env.VITE_BACKEND_API}/auth/login`}>
					<div className="p-5 flex gap-5 bg-primary-3 hover:bg-primary-4 rounded-xl items-center justify-start cursor-pointer">
						<div className="relative">
							<img
								src="/discord.svg"
								width={24}
								height={0}
								alt=""
								sizes="100%"
								className="object-cover"
							/>
						</div>
						<div className="flex flex-col">
							<div className="font-bold text-primary-6">Login with Discord</div>
							<div className="text-primary-5 text-sm">
								Eat your account hehehehe
							</div>
						</div>
					</div>
				</a>
			</div>
		</div>
	);
}
