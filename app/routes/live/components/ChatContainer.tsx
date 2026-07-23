import Anchorize from "~/routes/components/Anchorize";
import { memo, type RefObject } from "react";
import type { JoinLeaveMessage, Message } from "../types";

const ChatContainer = ({
	messages,
	containerRef,
	emotes,
}: {
	messages: (Message | JoinLeaveMessage)[];
	containerRef: RefObject<HTMLDivElement>;
	emotes: {
		id: string;
		name: string;
	}[];
}) => {
	return (
		<div
			className="flex-1 w-full p-5 flex flex-col gap-5 overflow-auto overflow-x-hidden"
			ref={containerRef}
		>
			{messages.map((data, idx) => ({ ...data, idx })).map(({ idx, ...message }) => {
				if ((message as Message).content) {
					const mes = message as Message;
					return (
						<div
							key={`${mes.username}${idx}`}
							className="flex gap-2.5 items-start text-subtext-0 w-full break-words"
						>
							<img
								src={mes.avatar}
								alt=""
								width={30}
								height={30}
								className="rounded-full"
							/>
							<div className="flex-1 flex items-center min-h-[30px] break-words overflow-hidden">
								<div className="w-full break-words overflow-hidden text-sm">
									<span className="font-bold pr-2.5">{mes.global_name}</span>
									<span className="align-middle break-words text-text">
										{<Anchorize input={mes.content} emoteList={emotes} />}
									</span>
								</div>
							</div>
						</div>
					);
				}

				if ((message as JoinLeaveMessage).state) {
					const mes = message as JoinLeaveMessage;
					return (
						<div
							key={`${mes.username}-${idx}-${mes.state}`}
							className="flex gap-2.5 items-start"
						>
							<div className="break-words overflow-x-hidden text-sm text-gray-400">
								{mes.username} has joined the chat.
							</div>
						</div>
					);
				}
				
				return "";
			})}
		</div>
	);
};

export default memo(ChatContainer);
