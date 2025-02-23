import { Link } from "react-router";
import { memo } from "react";

function Text({
	input,
	decorate,
	emoteList = [],
}: {
	input: string;
	decorate?: boolean;
	emoteList?: {
		id: string;
		name: string;
	}[];
}) {
	const emoteRegex = new RegExp(/(:[a-zA-Z0-9_]{2,}:)/g);
	const urlRegex = new RegExp(
		/(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*))/g,
	);
	const regex = new RegExp(`${urlRegex.source}|${emoteRegex.source}`, "g");

	const delim = input.split(regex).map((string) => {
		return {
			content: string ?? "",
			isURL: urlRegex.test(string),
			isEmote: emoteRegex.test(string),
		};
	});

	return (
		<>
			{delim.map((text, idx) =>
				!text.isURL && !text.isEmote ? (
					text.content
				) : text.isURL ? (
					decorate ? (
						<span
							key={`${text.content}-${idx}`}
							className="text-primary-5 font-bold underline"
						>
							{text.content}
						</span>
					) : (
						<Link
							to={text.content}
							key={`${text.content}-${idx}`}
							target="_blank"
							className="text-primary-5 font-bold underline"
						>
							{text.content}
						</Link>
					)
				) : emoteList.find(
						(emote) => emote.name === text.content.slice(1, -1),
					) ? (
					<span
						key={`${text.content}-${idx}`}
						contentEditable="false"
						suppressContentEditableWarning={true}
					>
						{/* <span className="hidden">﻿</span> */}
						<img
							loading="lazy"
							src={`${import.meta.env.VITE_BACKEND_API}/emojis/${text.content.slice(1, -1)}`}
							className="w-[30px] h-[30px] object-contain inline align-bottom"
							alt=""
						/>
						<span z-attr="pre-image" />
						<span className="hidden">{text.content}</span>
						{/* <span className="hidden">﻿</span> */}
					</span>
				) : (
					text.content
				),
			)}
		</>
	);
}

const Anchorize = memo(Text);
export default Anchorize;
