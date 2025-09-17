import axios from "axios";
import { Pen, X } from "lucide-react";
import {
	useEffect,
	useRef,
	useState,
	type ChangeEvent,
	type FormEvent,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import Button from "~/routes/components/Button";
import Input from "~/routes/components/Input";
import UserFlair from "~/routes/components/UserFlair";
import { hide } from "~/slices/post";
import { UserType, type UserState } from "~/types";

export default function Composer() {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [images, setImages] = useState<File[]>([]);
	const inputFileRef = useRef<HTMLInputElement>(null);
	const [isLoading, setIsLoading] = useState(false);

	const userData = useSelector(
		(state: {
			auth: {
				user: UserState;
			};
		}) => state.auth.user,
	);

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();

		if (userData.authType !== UserType.OK) {
			throw "You haven't logged in yet!";
		}

		const formData = new FormData(event.target as HTMLFormElement);
		if (!formData.get("post-content") || formData.get("post-content") === "")
			return;

		formData.append("post-uid", userData.id);

		for (const image of images) {
			formData.append("post-images", image);
		}

		try {
			setIsLoading(true);
			const res = await axios.post(
				`${import.meta.env.VITE_BACKEND_API}/posts`,
				formData,
				{
					withCredentials: true,
				},
			);

			dispatch(hide());

			const { postId } = res.data;
			navigate(`/posts/${postId}`);
		} catch (e) {
			console.error("An error has occured", e);
		}
	};

	const handleClick = (event: MouseEvent) => {
		if ((event.target as HTMLElement).dataset.isoutside) {
			dispatch(hide());
		}
	};

	const handleFiles = (event: ChangeEvent) => {
		const newFiles = Array.from((event.target as HTMLInputElement).files ?? []);

		if (images.length + newFiles.length > 4) {
			return;
		}

		setImages([...images, ...newFiles]);
	};

	const removeImage = (idx: number) => {
		setImages([...images.slice(0, idx), ...images.slice(idx + 1)]);
	};

	const ref = useRef<HTMLDivElement>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!ref.current) return;
		ref.current.addEventListener("click", handleClick);

		return () => ref.current?.removeEventListener("click", handleClick);
	}, [ref]);

	return (
		<div
			className="fixed top-0 left-0 w-full h-full md:p-40 p-2 bg-black/50 fadeIn flex md:items-start items-center justify-center z-50"
			data-isoutside={true}
			ref={ref}
		>
			<form
				action=""
				onSubmit={handleSubmit}
				className="md:w-[600px] w-full bg-base border border-surface-1 rounded-lg p-5 gap-2.5 flex drop-shadow-lg"
			>
				<UserFlair
					showName={false}
					data={
						userData.authType === UserType.OK
							? {
									id: userData.id,
									name: userData.username,
									avatar: userData.avatar,
								}
							: undefined
					}
					width={40}
					height={40}
					className="h-max"
				/>
				<div className="flex flex-1 gap-2.5 flex-col overflow-hidden">
					<Input
						hasIcon={false}
						placeholder="What's on your mind?"
						allowLineBreak={true}
						variant="custom"
						name="post-content"
						id="post-content"
						className="p-2.5 flex flex-1 items-center text-text "
					/>
					<div className="w-full overflow-auto">
						{images.length === 0 ? (
							""
						) : (
							<div className="w-full flex gap-2.5">
								{images.map((image, idx) => {
									const objectURL = URL.createObjectURL(image);
									return (
										<div
											className="relative w-[200px] h-[120px] overflow-hidden rounded-xl bg-primary-2 flex-shrink-0"
											key={objectURL}
										>
											<img
												src={URL.createObjectURL(image)}
												alt=""
												sizes="20vw"
												className="object-cover w-full h-full"
											/>
											<button
												type="button"
												className="absolute top-0 right-0 rounded-full bg-black/20 hover:bg-black/50 p-2 m-2"
												onClick={() => removeImage(idx)}
											>
												<X size={16} />
											</button>
										</div>
									);
								})}
							</div>
						)}
					</div>

					<div className="flex w-full items-center">
						<input
							type="file"
							className="file-input"
							// name="post-images"
							// id="post-images"
							multiple={true}
							accept="image/png,image/jpeg,image/webp"
							onChange={handleFiles}
							ref={inputFileRef}
						/>
						<Button
							name="Post"
							variant="custom"
							className="ml-auto w-max items-center gap-2.5 bg-surface-0 border border-surface-1 p-5 flex text-text rounded-lg py-2.5 cursor-pointer"
							type="submit"
							icon={
								isLoading ? (
									<div className="loading">
										{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
										<svg
											xmlns="http://www.w3.org/2000/svg"
											version="1.1"
											width="30px"
											height="30px"
										>
											<circle cx="15" cy="15" r="10" strokeLinecap="round" />
										</svg>
									</div>
								) : (
									<Pen size={16} strokeWidth={2} />
								)
							}
						/>
					</div>
				</div>
			</form>
		</div>
	);
}
