import { ChevronLeft, ChevronRight } from "lucide-react";
import {
	type Dispatch,
	type SetStateAction,
	useState,
	useRef,
	useEffect,
} from "react";
import type { CharacterData } from "../types";
import axios, { CanceledError } from "axios";
import { monthMap } from "../utils";

const getDatesOfMonth = (month: number, year: number) => {
	const firstDayOfMonth = new Date();
	firstDayOfMonth.setFullYear(year, month, 1);
	firstDayOfMonth.setHours(0, 0, 0, 0);

	const back = firstDayOfMonth.getDay();
	const next = 6 - firstDayOfMonth.getDay();

	const dates = [firstDayOfMonth];
	for (let i = 0; i < 5; i++) {
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		const date = new Date(dates.at(-1)!);
		date.setDate(date.getDate() + 7);

		dates.push(date);
	}

	const days = dates.reduce(
		(
			accm: {
				date: Date;
				idols: {
					Character: string;
					"Birthday:": Date;
					"Image Color:": string;
				}[];
			}[],
			curr,
		) => {
			const daysOfWeeks: {
				date: Date;
				idols: [];
			}[] = [];
			for (let i = 0; i < back; i++) {
				const date = new Date(curr);
				date.setDate(curr.getDate() - i - 1);

				daysOfWeeks.unshift({
					date,
					idols: [],
				});
			}

			daysOfWeeks.push({
				date: curr,
				idols: [],
			});

			for (let i = 0; i < next; i++) {
				const date = new Date(curr);
				date.setDate(curr.getDate() + i + 1);

				daysOfWeeks.push({
					date,
					idols: [],
				});
			}

			accm.push(...daysOfWeeks);
			return accm;
		},
		[],
	);

	return days;
};

const compareDate = (a?: Date, b?: Date) => {
	if (!a || !b) return false;
	return (
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate() &&
		a.getFullYear() === b.getFullYear()
	);
};

const useBirthdays = (month: number) => {
	const [chars, setChars] = useState<CharacterData[]>([]);

	useEffect(() => {
		const controller = new AbortController();
		const getChars = async () => {
			try {
				const res = await axios.get(
					`${import.meta.env.VITE_BACKEND_API}/characters?month=${month + 1}`,
					{
						signal: controller.signal,
					},
				);

				setChars(res.data);
			} catch (error) {
				if (error instanceof CanceledError) return;
				console.error(error);
				return;
			}
		};
		getChars();

		return () => {
			controller.abort("Component Unmounted");
		};
	}, [month]);

	return chars;
};

export default function Calendar({
	setIdols,
	currDate,
	setCurrDate,
}: {
	setIdols?: Dispatch<SetStateAction<CharacterData[] | undefined>>;
	currDate?: Date;
	setCurrDate: Dispatch<SetStateAction<Date | undefined>>;
}) {
	const [currentDate, setCurrentDate] = useState(new Date());

	const [month, setMonth] = useState(currentDate.getMonth());
	const [year, setYear] = useState(currentDate.getFullYear());
	const birthdays = useBirthdays(month);
	const calendarRef = useRef<HTMLDivElement>(null);

	const days = getDatesOfMonth(month, year);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const date = new Date();
		setCurrentDate(date);

		const chars = birthdays.filter((char) => {
			return (
				char.Birthday?.month === date.getMonth() + 1 &&
				char.Birthday?.day === date.getDate()
			);
		});

		if (chars.length === 0 || chars[0].Birthday?.month !== month + 1) return;

		setIdols?.(chars);
		setCurrDate(date);
	}, [birthdays, month]);

	return (
		<div className="calendar w-full bg-primary-3 p-2.5 rounded-2xl overflow-hidden grid grid-cols-7 auto-rows-max gap-2 h-max shadow-md">
			<div className="flex items-center justify-between col-span-full rounded-md bg-primary-5 text-primary-1">
				<div className="font-bold p-2.5">
					{monthMap[month as keyof typeof monthMap]} {year}
				</div>
				<div className="flex items-center gap-2.5">
					<button
						type="button"
						onClick={() => {
							// if (calendarRef.current) {
							// 	calendarRef.current.style.viewTransitionName = "calendarBack";
							// }

							if (month === 0) {
								setMonth(11);
								setYear(year - 1);
								// document.startViewTransition(() => {
								// 	flushSync(() => {
								// 		setMonth(11);
								// 		setYear(year - 1);
								// 	});
								// });

								return;
							}

							setMonth(month - 1);
							// document.startViewTransition(() => {
							// 	flushSync(() => {
							// 		setMonth(month - 1);
							// 	});
							// });
						}}
						className="p-2.5 rounded-full hover:bg-primary-1/60 hover:text-primary-6 transition-colors"
					>
						<ChevronLeft size={20} />
					</button>
					<button
						type="button"
						onClick={() => {
							// if (calendarRef.current) {
							// 	calendarRef.current.style.viewTransitionName = "calendarNext";
							// }

							if (month === 11) {
								setMonth(0);
								setYear(year + 1);
								// document.startViewTransition(() => {
								// 	flushSync(() => {
								// 		setMonth(0);
								// 		setYear(year + 1);
								// 	});
								// });

								return;
							}

							setMonth(month + 1);
							// document.startViewTransition(() => {
							// 	flushSync(() => {
							// 		setMonth(month + 1);
							// 	});
							// });
						}}
						className="p-2.5 rounded-full hover:bg-primary-1/60 hover:text-primary-6 transition-colors"
					>
						<ChevronRight size={20} />
					</button>
				</div>
			</div>
			<div className="p-2.5 text-sm font-bold rounded-md">Sun (日)</div>
			<div className="p-2.5 text-sm font-bold rounded-md">Mon (月)</div>
			<div className="p-2.5 text-sm font-bold rounded-md">Tue (火)</div>
			<div className="p-2.5 text-sm font-bold rounded-md">Wed (水)</div>
			<div className="p-2.5 text-sm font-bold rounded-md">Thu (木)</div>
			<div className="p-2.5 text-sm font-bold rounded-md">Fri (金)</div>
			<div className="p-2.5 text-sm font-bold rounded-md">Sat (土)</div>
			<div className="col-span-full grid grid-cols-7 gap-2" ref={calendarRef}>
				{days.map((day) => {
					return (
						<button
							type="button"
							key={day.date.getTime()}
							className={`
								text-left relative rounded-md p-2.5 text-sm flex flex-col gap-2.5 justify-between font-bold hover:bg-primary-5 hover:text-primary-1 hover:opacity-100 transition-all
								${day.date.getMonth() !== month ? "opacity-40" : ""} 
								${compareDate(day.date, currentDate) ? "bg-primary-5 text-primary-1" : "text-primary-5 bg-primary-5/20"}
								`.replaceAll(/\s+/g, " ")}
							onClick={() => {
								setIdols?.(
									birthdays.filter((char) => {
										return (
											char.Birthday?.month === day.date.getMonth() + 1 &&
											char.Birthday?.day === day.date.getDate()
										);
									}),
								);
								setCurrDate(day.date);
							}}
						>
							<div
								className={`absolute top-0 left-0 w-full h-full rounded-md ${compareDate(day.date, currDate) ? "border-2 border-primary-5" : ""}`}
							/>
							{day.date.getDate()}
							<div className="flex ml-auto gap-[2px] flex-wrap justify-end min-h-2.5">
								{birthdays
									.filter((char) => {
										return (
											char.Birthday?.month === day.date.getMonth() + 1 &&
											char.Birthday?.day === day.date.getDate()
										);
									})
									.map((idol) => (
										<div
											className="rounded-full h-2.5 w-2.5"
											style={{
												backgroundColor: idol["Image Color"] ?? "#DBDCFF",
											}}
											key={idol.Index}
										/>
									))}
							</div>
						</button>
					);
				})}
			</div>
		</div>
	);
}
