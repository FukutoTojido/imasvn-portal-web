import {
	type HTMLProps,
	type RefObject,
	useEffect,
	useRef,
	useState,
} from "react";
import type { CharacterData, RefList } from "../types";
import axios, { CanceledError } from "axios";

export default function Popup({
	idolInfo,
	popupRefList,
	...props
}: {
	idolInfo?: CharacterData;
	popupRefList: RefObject<RefList>;
} & HTMLProps<HTMLDivElement>) {
	const [info, setInfo] =
		useState<
			Record<string, string | number | Record<string, number> | undefined>
		>();

	const ref = useRef<HTMLDivElement>(null);
	const avaRef = useRef<HTMLImageElement>(null);
	const characterRef = useRef<HTMLDivElement>(null);
	const nameRef = useRef<HTMLDivElement>(null);
	const descriptionRef = useRef<HTMLUListElement>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!popupRefList?.current) return;
		popupRefList.current.card = ref.current;
		popupRefList.current.avatar = avaRef.current;
		popupRefList.current.character = characterRef.current;
		popupRefList.current.name = nameRef.current;
		popupRefList.current.description = descriptionRef.current;
	}, []);

	useEffect(() => {
		const controller = new AbortController();
		const getInfo = async () => {
			try {
				if (!idolInfo?.Index) return;
				const res = await axios.get(
					`${import.meta.env.VITE_BACKEND_API}/characters/${idolInfo?.Index}`,
					{
						signal: controller.signal,
					},
				);

				setInfo(res.data);
			} catch (error) {
                if (error instanceof CanceledError) return;
				console.error(error);
			}
		};

		getInfo();

		return () => {
			controller.abort("Component unmounted");
		};
	}, [idolInfo?.Index]);

	return (
		<div
			ref={ref}
			className="max-w-full max-h-full overflow-auto w-[800px] p-5 bg-primary-3 rounded-xl flex gap-5 text-primary-6 flex-col sm:flex-row items-center sm:items-start"
			{...{ ...props }}
		>
			<img
				ref={avaRef}
				src={idolInfo?.ImgURL ?? "/fuyuping.png"}
				alt=""
				width={240}
				height={240}
				className="w-[240px] h-[240px] rounded-xl sm:bg-primary-2 object-cover object-top"
			/>
			<div className="sm:h-full h-auto flex-1 flex-col flex gap-5 w-full">
				<div className="w-full sm:w-auto flex flex-col text-center sm:text-left">
					<div className="text-3xl font-bold" ref={characterRef}>
						{idolInfo?.Character ?? ""}
					</div>
					<div className="text-lg line-clamp-1" ref={nameRef}>
						{idolInfo?.Name.split("(")[0] ?? ""}
					</div>
				</div>
				<div className="flex-1 bg-primary-2 w-full p-5 rounded-xl text-sm">
					<ul className="w-full" ref={descriptionRef}>
						{info ? (
							Object.keys(info)
								.filter(
									(key) =>
										![
											"Name",
											"Character",
											"ImgURL",
											"WikiURL",
											"Index",
										].includes(key),
								)

								.map((key: string) => {
									if (key === "Birthday") {
										return (
											<li key={key}>
												<span className="font-bold">{key}</span>:{" "}
												{(info[key] as Record<string, number>).month
													.toString()
													.padStart(2, "0")}
												/
												{(info[key] as Record<string, number>).day
													.toString()
													.padStart(2, "0")}
											</li>
										);
									}
									return (
										<li key={key}>
											<span className="font-bold">{key}</span>:{" "}
											{info[key] as string}
										</li>
									);
								})
						) : (
							<>
								<li className="w-full h-[1em] rounded-md bg-primary-4 mb-1 skeleton2" />
							</>
						)}
					</ul>
				</div>
			</div>
		</div>
	);
}
