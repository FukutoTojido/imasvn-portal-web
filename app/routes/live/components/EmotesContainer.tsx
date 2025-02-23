import {  memo, type RefObject } from "react";
import { renderToString } from "react-dom/server";
import Anchorize from "~/routes/components/Anchorize";

const createRange = (node: HTMLElement, targetPosition: number) => {
	const range = document.createRange();
	range.selectNode(node);
	range.setStart(node, 0);

	let pos = 0;
	const stack: Node[] = [node];
	while (stack.length > 0) {
		const current = stack.pop();

		if (current?.nodeType === Node.TEXT_NODE) {
			const len = current.textContent?.length ?? 0;
			if (pos + len >= targetPosition) {
				range.setEnd(current, targetPosition - pos);
				return range;
			}
			pos += len;
		} else if (current?.childNodes && current?.childNodes.length > 0) {
			for (let i = current.childNodes.length - 1; i >= 0; i--) {
				stack.push(current.childNodes[i]);
			}
		}
	}

	// The target position is greater than
	// the length of the contenteditable element
	range.setEnd(node, node.childNodes.length);
	return range;
};

const setPosition = (contentEle: HTMLElement, targetPosition: number) => {
	const range = createRange(contentEle, targetPosition);
	const selection = window.getSelection();
	if (!selection) return;
	selection.removeAllRanges();
	selection.addRange(range);
	range.collapse();
};

const EmotesContainer = ({
	emoteRef,
	emotes,
	chatRef,
}: {
	emoteRef: RefObject<HTMLDivElement>;
	emotes: {
		id: string;
		name: string;
	}[];
	chatRef: RefObject<HTMLSpanElement>;
}) => {
	return (
		<div
			className="absolute emoteContainer w-[400px]"
			id="emote-container"
			// @ts-ignore
			popover="auto"
			ref={emoteRef}
		>
			<div className="bg-primary-3 rounded-md p-5 w-full grid grid-cols-9 h-80 overflow-auto gap-2 shadow-xl">
				{emotes.map((emote) => (
					<button
						type="button"
						key={emote.id}
						onClick={() => {
							if (!chatRef.current) return;
							chatRef.current.innerHTML += renderToString(
								<Anchorize
									input={`:${emote.name}: `}
									emoteList={emotes}
									decorate={true}
								/>,
							);
							emoteRef.current?.hidePopover();
							chatRef.current.focus();
							setPosition(
								chatRef.current,
								chatRef.current.textContent?.length ?? 0,
							);
						}}
					>
						<img
							src={`${import.meta.env.VITE_BACKEND_API}/emojis/${emote.name}`}
							width={40}
							height={40}
							className="object-contain w-full h-full aspect-square rounded-sm bg-black/20 select-none"
							alt={emote.name}
						/>
					</button>
				))}
			</div>
		</div>
	);
};

export default memo(EmotesContainer);
