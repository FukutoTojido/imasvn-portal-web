import axios, { CanceledError } from "axios";
import {
	useEffect,
	useRef,
	useState,
	type Dispatch,
	type RefObject,
	type SetStateAction,
} from "react";
import { useSelector } from "react-redux";
import useWebSocket from "react-use-websocket";
import type store from "~/store";
import {
	SOCKET_ENUM,
	type JoinLeaveMessage,
	type Message,
	type Viewer,
} from "../types";
import { UserType } from "~/types";

import "./Chat.css";
import Input from "./Input";
import ChatContainer from "./ChatContainer";
import EmotesContainer from "./EmotesContainer";

function useEmotes() {
	const [emotes, setEmotes] = useState<
		{
			id: string;
			name: string;
		}[]
	>([]);

	useEffect(() => {
		const controller = new AbortController();
		const getEmotes = async () => {
			try {
				const res = await axios.get(
					`${import.meta.env.VITE_BACKEND_API}/emojis`,
					{
						signal: controller.signal,
					},
				);
				setEmotes(res.data);
			} catch (error) {
				if (error instanceof CanceledError) return;
				console.error(error);
			}
		};
		getEmotes();

		return () => {
			controller.abort("Component unmounted");
		};
	}, []);

	return emotes;
}

export default function Chat({
	isFullscreen,
	setViewers,
}: {
	isFullscreen: boolean;
	setViewers: Dispatch<SetStateAction<Viewer[]>>;
}) {
	const userData = useSelector(
		(state: ReturnType<typeof store.getState>) => state.auth.user,
	);
	const [messages, setMessages] = useState<(Message | JoinLeaveMessage)[]>([]);
	const chatRef = useRef<HTMLSpanElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const emoteRef = useRef<HTMLDivElement>(null);
	const emotes = useEmotes();

	const { sendJsonMessage } = useWebSocket(
		import.meta.env.VITE_WEBSOCKET_ENDPOINT,
		{
			onOpen: () => {
				console.log("WebSocket connected!");
			},
			onMessage: (event) => {
				const { type, payload } = JSON.parse(event.data);

				if (
					type === SOCKET_ENUM.USER_STATE ||
					type === SOCKET_ENUM.NEW_MESSAGE
				) {
					setMessages([...messages, payload]);
					return;
				}

				if (type === SOCKET_ENUM.UPDATE_USERCOUNT) {
					setViewers(payload);
					return;
				}
			},
			onClose: () => {
				console.log("WebSocket closed!");
			}
		},
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (userData.authType !== UserType.OK) return;
		sendJsonMessage?.({
			type: SOCKET_ENUM.NEW_USER,
			payload: userData,
		});
	}, [sendJsonMessage, userData.authType]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		containerRef.current?.scrollTo(0, containerRef.current.scrollHeight);
	}, [messages.length]);

	return (
		<div
			className={`bg-[#363753] md:rounded-xl ${isFullscreen ? "md:!rounded-none" : ""} flex flex-col overflow-hidden h-full w-full relative`}
		>
			<ChatContainer
				containerRef={containerRef as RefObject<HTMLDivElement>}
				messages={messages}
				emotes={emotes}
			/>
			<EmotesContainer
				chatRef={chatRef as RefObject<HTMLSpanElement>}
				emoteRef={emoteRef as RefObject<HTMLDivElement>}
				emotes={emotes}
			/>
			<Input
				chatRef={chatRef}
				sendJsonMessage={sendJsonMessage}
				emotes={emotes}
			/>
		</div>
	);
}
