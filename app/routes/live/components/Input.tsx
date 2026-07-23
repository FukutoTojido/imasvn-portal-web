import { UserType } from "~/types";
import { SendHorizontal, Smile } from "lucide-react";
import {
	type KeyboardEventHandler,
	memo,
	type RefObject,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { useSelector } from "react-redux";
import { SOCKET_ENUM } from "../types";
import Anchorize from "~/routes/components/Anchorize";
import { renderToString } from "react-dom/server";
import type { SendJsonMessage } from "react-use-websocket/dist/lib/types";
import type store from "~/store";
import ContentEditable from "~/lib/react-contenteditable";
import { Popover, PopoverTrigger, PopoverContent } from "~/components/ui/popover";
import EmotesContainer from "./EmotesContainer";
import { Button } from "~/components/ui/button";

function isCaretEnd(editableDiv: HTMLElement) {
	const selection = window.getSelection();
	if (!selection) return -1;
	const range = selection.getRangeAt(0);
	const clonedRange = range.cloneRange();
	clonedRange.selectNodeContents(editableDiv);
	clonedRange.setEnd(range.endContainer, range.endOffset);

	return clonedRange.toString().length === editableDiv.textContent?.length;
}

const Input = ({
	chatRef,
	sendJsonMessage,
	emotes,
}: {
	chatRef: RefObject<HTMLSpanElement | null>;
	sendJsonMessage: SendJsonMessage;
	emotes: {
		id: string;
		name: string;
	}[];
}) => {
	const userData = useSelector(
		(state: ReturnType<typeof store.getState>) => state.auth.user,
	);
	const [html, setHtml] = useState("");

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const sendMessage = useCallback(() => {
		const chatContent = chatRef.current?.textContent?.trim() ?? "";
		if (chatContent === "" || userData.authType !== UserType.OK) return;

		sendJsonMessage({
			type: SOCKET_ENUM.NEW_MESSAGE,
			payload: {
				username: userData.username,
				global_name: userData.global_name,
				avatar: userData.avatar,
				id: userData.id,
				time: Date.now(),
				content: chatContent,
			},
		});

		setHtml("");
		if (!chatRef.current) return;
		chatRef.current.innerHTML = "";
	}, [userData.authType]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const chatElement = chatRef.current;

		const handleInput = (event: KeyboardEvent) => {
			if (!chatElement) return;

			if (event.key === "Enter" && !event.shiftKey) {
				event.preventDefault();
				sendMessage();
				// chatElement.innerHTML = "";
				// containerRef.current?.scrollTo(0, containerRef.current.scrollHeight);
			}
		};

		const handleCopy = async () => {
			await navigator.clipboard.writeText(chatElement?.textContent ?? "");
		};

		chatElement?.addEventListener("keydown", handleInput);
		chatElement?.addEventListener("copy", handleCopy);

		return () => {
			chatElement?.removeEventListener("keydown", handleInput);
			chatElement?.removeEventListener("copy", handleCopy);
		};
	}, [sendMessage]);

	const handleInput = () => {
		if (!chatRef.current) return;
		const chatContent = chatRef.current.textContent ?? "";

		const string = renderToString(
			<Anchorize input={chatContent} decorate={true} emoteList={emotes} />,
		);
		setHtml(
			string,
			// chatContent,
		);
	};

	const handleBackspace: KeyboardEventHandler<HTMLDivElement> = (
		event: React.KeyboardEvent<HTMLDivElement>,
	) => {
		if (
			!chatRef.current ||
			event.key !== "Backspace" ||
			chatRef.current.innerText !== ""
		)
			return;

		const isEnd = isCaretEnd(chatRef.current);
		if (!isEnd) return;

		const ele = [...chatRef.current.children].at(-1);
		if (!ele) return;

		chatRef.current.removeChild(ele);
		event.preventDefault();

		// console.log(chatRef.current.childNodes);
	};

	const inputRef = useRef<HTMLDivElement>(null);

	if (userData.authType === UserType.OK && userData.isJoinedServer)
		return (
			<div className="flex w-full gap-5 items-center p-4 chatBox border-t border-foreground/10" ref={inputRef}>
				<ContentEditable
					tagName="span"
					html={html}
					onChange={handleInput}
					onBlur={() => {}}
					onKeyUp={() => {}}
					onKeyDown={handleBackspace}
					innerRef={chatRef as RefObject<HTMLSpanElement>}
					contentEditable="plaintext-only"
					className="flex-1 text-text focus:outline-none chatInput break-words overflow-hidden"
				/>

				<div className="h-full border-r-1 border-foreground/10" />
				<Popover modal>
					<PopoverTrigger asChild>
						<Button variant="ghost" type="button" popoverTarget="emote-container" className="size-10 p-0">
							<Smile className="size-6"/>
						</Button>
					</PopoverTrigger>
					<PopoverContent align="end">
						<EmotesContainer
							chatRef={chatRef as RefObject<HTMLSpanElement>}
							emotes={emotes}
						/>
					</PopoverContent>
				</Popover>
				<Button variant="ghost" className="p-0 size-10" type="button" onClick={() => sendMessage()}>
					<SendHorizontal className="size-6" />
				</Button>
			</div>
		);

	return (
		<div className="flex w-full gap-5 items-center p-5 chatBox text-text">
			You must be a member of THE iDOLM@STER Vietnam Discord Server to chat
		</div>
	);
};

export default memo(Input);
