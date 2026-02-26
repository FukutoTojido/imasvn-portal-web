import axios, { CanceledError } from "axios";
import {
	type Dispatch,
	type RefObject,
	type SetStateAction,
	useEffect,
	useRef,
	useState,
} from "react";
import { useSelector } from "react-redux";
import useWebSocket from "react-use-websocket";
import type store from "~/store";
import { UserType } from "~/types";
import {
	type JoinLeaveMessage,
	type Message,
	SOCKET_ENUM,
	type Viewer,
} from "../types";

import "./Chat.css";
import ChatContainer from "./ChatContainer";
import Input from "./Input";
import { useParams } from "react-router";

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
	const emotes = useEmotes();
	const params = useParams();

	const { sendJsonMessage } = useWebSocket(
		`${import.meta.env.VITE_WEBSOCKET_ENDPOINT}/${params.id ?? "root"}`,
		{
			onOpen: () => {
				console.log(`${new Date().toISOString()} - WebSocket connected!`);
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
				console.log(`${new Date().toISOString()} - WebSocket disconnected!`);
			},
			reconnectInterval: 5000,
			shouldReconnect: () => true
		},
	);

	useEffect(() => {
		if (userData.authType !== UserType.OK) return;
		sendJsonMessage?.({
			type: SOCKET_ENUM.NEW_USER,
			payload: userData,
		});

		const interval = setInterval(() => {
			sendJsonMessage?.({
				type: SOCKET_ENUM.PING,
			});
		}, 60000);

		return () => {
			clearInterval(interval);
		}
	}, [sendJsonMessage, userData]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: Only care about chat length
	useEffect(() => {
		containerRef.current?.scrollTo(0, containerRef.current.scrollHeight);
	}, [messages.length]);

	return (
		<div
			className={`bg-base md:rounded-md border border-surface-1 ${isFullscreen ? "md:!rounded-none" : ""} flex flex-col overflow-hidden h-full w-full relative`}
		>
			<ChatContainer
				containerRef={containerRef as RefObject<HTMLDivElement>}
				messages={messages}
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
