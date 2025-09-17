import { memo, type RefObject } from "react";
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
	emotes,
	chatRef,
}: {
	emotes: {
		id: string;
		name: string;
	}[];
	chatRef: RefObject<HTMLSpanElement>;
}) => {
	return (
		<div className="w-full grid grid-cols-5 h-80 overflow-auto gap-2 shadow-xl pr-2">
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
						className="object-contain w-10 h-10 aspect-square rounded-sm bg-black/20 select-none"
						alt={emote.name}
					/>
				</button>
			))}
		</div>
	);
};

export default memo(EmotesContainer);
