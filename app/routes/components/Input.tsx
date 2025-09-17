import { Search } from "lucide-react";
import { type FormEvent, useEffect, useRef } from "react";

const styles: {
	[key: string]: string;
} = {
	normal:
		"p-2.5 px-5 flex flex-1 items-center text-primary-6 bg-primary-3 rounded-full focus-within:outline-2 outline-primary-5 text-sm",
	midRounded:
		"p-2.5 flex flex-1 items-center text-primary-6 bg-primary-3 rounded-lg focus-within:outline-2 outline-primary-5 text-sm",
	post: "p-2.5 flex flex-1 items-center text-primary-6 bg-primary-3 rounded-lg",
	characters:
		"p-2.5 px-5 flex flex-1 items-center text-alt-accent bg-white rounded-full focus-within:outline-2 outline-alt-accent text-sm overflow-hidden shadow-md focus-within:transition-shadow",
	custom: ""
};

export default function Input({
	hasIcon = true,
	allowLineBreak = false,
	allowShiftBreak = false,
	clearOnEnter = false,
	variant = "normal",
	placeholder = "",
	onEnter = () => {},
	onInput = () => {},
	...props
}:
	| {
			hasIcon?: boolean;
			allowLineBreak?: boolean;
			allowShiftBreak?: boolean;
			clearOnEnter?: boolean;
			variant?: keyof typeof styles;
			placeholder?: string;
			onEnter?: () => unknown;
			onInput?: () => unknown;
	  }
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	| any) {
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const spanRef = useRef<HTMLSpanElement>(null);

	const copyContent = (event: FormEvent) => {
		if (!inputRef || !inputRef.current || !event.target) return;
		inputRef.current.value = allowLineBreak
			? ((event.target as HTMLElement).innerText ?? "")
			: ((event.target as HTMLElement).textContent ?? "");

		if (typeof props.valuechange !== "function") return;
		props.valuechange(
			allowLineBreak
				? (event.target as HTMLElement).innerText
				: (event.target as HTMLElement).textContent,
		);
	};

	useEffect(() => {
		if (!spanRef.current) return;
		const element = spanRef.current;

		const handleEnter = (event: KeyboardEvent) => {
			onInput?.(inputRef.current, spanRef.current);
			if (event.key !== "Enter") return;
			if (allowLineBreak || (allowShiftBreak && event.shiftKey)) return;

			event.preventDefault();
			onEnter?.(inputRef.current, spanRef.current);
		};

		element.addEventListener("keydown", handleEnter);

		return () => {
			element.removeEventListener("keydown", handleEnter);
		};
	}, [allowLineBreak, allowShiftBreak, onEnter, onInput]);

	return (
		<div
			{...{
				...props,
				className: `${styles[variant]} ${props?.className ?? ""}`,
			}}
		>
			<span
				className="flex-1 focus:outline-none overflow-hidden"
				contentEditable="plaintext-only"
				data-placeholder={placeholder}
				onInput={copyContent}
				ref={spanRef}
			/>
			{hasIcon && <Search />}
			<textarea
				name={props.name ?? ""}
				id={props.id ?? ""}
				style={{ display: "none" }}
				ref={inputRef}
			/>
		</div>
	);
}
