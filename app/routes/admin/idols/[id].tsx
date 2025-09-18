import axios from "axios";
import { DateTime } from "luxon";
import { useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { ComboBox } from "~/components/ui/combobox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { CharacterData } from "~/routes/calendar/types";
import NotFound from "~/routes/components/NotFound";
import PreviewImage from "../components/PreviewImage";
import type { Route } from "./+types/[id]";

export const loader = async ({ params: { id } }: Route.LoaderArgs) => {
	try {
		const { data: characterData } = await axios.get<CharacterData>(
			`${import.meta.env.VITE_BACKEND_API}/characters/${id}`,
		);

		return characterData;
	} catch (e) {
		console.error(e);
		return null;
	}
};

export type FormType = Partial<Omit<CharacterData, "id">>;

export default function Page({
	loaderData: characterData,
}: Route.ComponentProps) {
	const methods = useForm<FormType>({
		values: characterData ?? {},
	});

	const { register, handleSubmit, getValues, watch, setValue } = methods;

	const month = watch("birthmonth");
	const dateList = useMemo(() => {
		if (!month) return [...Array(31)].map((_, idx) => idx + 1);
		if ([1, 3, 5, 7, 8, 10, 12].includes(month))
			return [...Array(31)].map((_, idx) => idx + 1);
		if ([4, 6, 9, 11].includes(month))
			return [...Array(30)].map((_, idx) => idx + 1);
		return [...Array(29)].map((_, idx) => idx + 1);
	}, [month]);

	if (!characterData) return <NotFound />;

	const update = async (formData: FormType) => {
		try {
			await axios.patch(
				`${import.meta.env.VITE_BACKEND_API}/characters/${characterData.id}`,
				{
					...formData,
					age: +(formData?.age ?? 0),
				},
				{
					withCredentials: true,
				},
			);
			toast("Update idol information success!");
		} catch (e) {
			console.error(e);
			toast.error("Update idol information failed!");
		}
	};

	return (
		<FormProvider {...methods}>
			<form onSubmit={handleSubmit(update)} className="self-center max-w-full">
				<Card className="w-[700px] max-w-full bg-base border-surface-1 text-text">
					<CardHeader>
						<CardTitle>{characterData.name}</CardTitle>
						<CardDescription className="text-subtext-0">
							Edit information of {characterData.name}
						</CardDescription>
					</CardHeader>
					<CardContent className="grid grid-cols-2 gap-5">
						<div className="col-span-full aspect-square">
							<PreviewImage url={watch("icon")} cropper={false} />
						</div>
						<div className="flex flex-col gap-2.5">
							<Label>Name</Label>
							<Input {...register("name")} className="text-text" />
						</div>
						<div className="flex flex-col gap-2.5">
							<Label>Japanese Name</Label>
							<Input {...register("japaneseName")} className="text-text" />
						</div>
						<div className="flex flex-col gap-2.5">
							<Label>VA</Label>
							<Input {...register("VA")} className="text-text" />
						</div>
						<div className="flex flex-col gap-2.5">
							<Label>VA Japanese</Label>
							<Input {...register("japaneseVA")} className="text-text" />
						</div>
						<div className="flex flex-col gap-2.5">
							<Label>Age</Label>
							<Input {...register("age")} type="tel" className="text-text" />
						</div>
						<div className="flex flex-col gap-2.5">
							<Label>Icon</Label>
							<Input {...register("icon")} className="text-text" />
						</div>
						<div className="flex flex-col gap-2.5">
							<Label>Image Color</Label>
							<div className="flex gap-2.5 items-center">
								<div
									className="h-[80%] aspect-square rounded-md"
									style={{
										background: watch("imageColor"),
									}}
								></div>
								<Input
									{...register("imageColor")}
									className="text-text flex-1"
								/>
							</div>
						</div>
						<div className="flex flex-col gap-2.5">
							<Label>Birthday</Label>
							<div className="grid grid-cols-2 gap-2.5">
								<ComboBox
									{...register("birthdate")}
									className="w-full"
									defaultValue={getValues("birthdate")?.toString() ?? "1"}
									options={dateList.map((val) => ({
										value: val.toString(),
										label: val.toString(),
									}))}
									onValueChange={(value) => setValue("birthdate", +value)}
								/>
								<ComboBox
									{...register("birthmonth")}
									defaultValue={getValues("birthmonth")?.toString() ?? "1"}
									className="w-full"
									options={[...Array(12)].map((_, idx) => ({
										value: (idx + 1).toString(),
										label: DateTime.fromFormat(
											(idx + 1).toString(),
											"M",
										).toFormat("LLLL"),
									}))}
									onValueChange={(value) => setValue("birthmonth", +value)}
								/>
							</div>
						</div>
					</CardContent>
					<CardFooter>
						<Button
							type="submit"
							className="ml-auto bg-text text-mantle hover:bg-subtext-0"
						>
							Save
						</Button>
					</CardFooter>
				</Card>
			</form>
		</FormProvider>
	);
}
