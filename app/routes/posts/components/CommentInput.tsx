import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSelector } from "react-redux";
import type { SWRInfiniteKeyedMutator } from "swr/infinite";
import {
	UserType,
	type Comment,
	type PostData,
	type UserFlairData,
} from "~/types";
import type store from "~/store";
import axios, { AxiosError } from "axios";
import UserFlair from "~/routes/components/UserFlair";
import Input from "~/routes/components/Input";
import { SendHorizontal } from "lucide-react";

export default function CommentInput({
	postData,
	mutate,
}: {
	postData: PostData;
	mutate: SWRInfiniteKeyedMutator<Comment[]>;
}) {
	const formRef = useRef<HTMLFormElement>(null);
	const userData = useSelector(
		(state: ReturnType<typeof store.getState>) => state.auth.user,
	);
	const flairData: UserFlairData | undefined =
		userData.authType !== UserType.OK
			? undefined
			: {
					id: userData.id,
					name: userData.global_name,
					avatar: userData.avatar,
				};

	const handleComment = async (event: FormEvent) => {
		event.preventDefault();

		if (userData.authType !== UserType.OK) {
			throw "You haven't logged in yet!";
		}

		const formData = new FormData(event.target as HTMLFormElement);
		if (
			!formData.get("comment-content") ||
			formData.get("comment-content") === ""
		)
			return;

		try {
			await axios.post(
				`${import.meta.env.VITE_BACKEND_API}/posts/${postData.id}/comments`,
				formData,
				{
					withCredentials: true,
				},
			);

			mutate?.();
		} catch (e) {
			if (e instanceof AxiosError) {
				console.error((e as AxiosError).toJSON());
				return;
			}

			console.error(e);
		}
	};

	const handleEnter = (
		textElement?: HTMLTextAreaElement,
		spanElement?: HTMLSpanElement,
	) => {
		if (!formRef.current) return;
		formRef.current.requestSubmit();

		if (textElement) textElement.value = "";
		if (spanElement) spanElement.textContent = "";
	};

	return userData.authType === UserType.OK && userData.isJoinedServer ? (
		<form
			action=""
			onSubmit={handleComment}
			className="w-full flex gap-2.5 items-start"
			ref={formRef}
		>
			<div className="h-[41px] flex items-center">
				<UserFlair data={flairData} showName={false} />
			</div>
			<Input
				placeholder="Comment"
				hasIcon={false}
				variant="custom"
				allowShiftBreak={true}
				name="comment-content"
				id="comment-content"
				onEnter={handleEnter}
				className="p-2.5 flex flex-1 items-center text-text focus-within:border-overlay-0 border-b border-surface-1 text-sm"
			/>
			<button className="text-text h-[41px]" type="submit">
				<SendHorizontal />
			</button>
		</form>
	) : (
		<div className="w-full gap-2.5 p-2.5 rounded-lg text-center text-text">
			You must be a member of THE iDOLM@STER Vietnam Discord Server to interact
		</div>
	);
}
