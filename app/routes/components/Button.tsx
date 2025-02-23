export default function Button({ ...props }) {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const handleClick = (event: any) => {
		if (!props.onClick) return;
		props.onClick(event);
	};

	const style = {
		normal:
			"w-full flex gap-5 text-primary-6 font-semibold rounded-lg bg-primary-3 hover:bg-primary-2 px-5 py-2.5 cursor-pointer",
		menu: "w-full flex gap-5 text-primary-6 font-semibold rounded-lg bg-primary-2 hover:bg-primary-3 px-5 py-2.5 cursor-pointer",
		outlined:
			"w-full flex gap-5 text-primary-6 font-semibold rounded-lg border-2 border-primary-5 hover:bg-primary-3 px-5 py-2.5 cursor-pointer",
		highlighted:
			"w-full flex gap-5 text-primary-1 font-semibold rounded-lg bg-primary-5 hover:bg-primary-4.5 px-5 py-2.5 cursor-pointer",
		disabled:
			"w-full flex gap-5 text-primary-6 font-semibold rounded-lg bg-primary-3 opacity-50 px-5 py-2.5 cursor-default cursor-pointer",
		danger:
			"w-full flex gap-5 text-red font-semibold rounded-lg bg-primary-3 hover:bg-primary-2 px-5 py-2.5 hover:bg-red hover:text-primary-1 cursor-pointer",
		danger_menu:
			"w-full flex gap-5 text-red font-semibold rounded-lg bg-primary-2 hover:bg-primary-2 px-5 py-2.5 hover:bg-red hover:text-primary-1 cursor-pointer",
	};

	return (
		<button
			type={props.type ?? "button"}
			className={
				// biome-ignore lint/style/useTemplate: <explanation>
				style[
					(props.variant as
						| "normal"
						| "outlined"
						| "highlighted"
						| "disabled"
						| "danger") ?? "normal"
				] +
				" " +
				props.className
			}
			onClick={handleClick}
		>
			{props.icon ?? ""}
			{props.name ?? ""}
		</button>
	);
}
