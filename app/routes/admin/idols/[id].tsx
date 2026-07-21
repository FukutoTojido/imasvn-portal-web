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
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "~/components/ui/combobox";
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
				<Card className="w-[700px] max-w-full">
					<CardHeader>
						<CardTitle>{characterData.name}</CardTitle>
						<CardDescription>
							Edit information of {characterData.name}
						</CardDescription>
					</CardHeader>
					<CardContent className="grid grid-cols-2 gap-5">
						<div className="col-span-full aspect-video">
							<PreviewImage
								url={watch("icon")}
								cropper={false}
								className="w-full aspect-video"
							/>
						</div>
						<div className="flex flex-col gap-2.5">
							<Label>Name</Label>
							<Input {...register("name")} />
						</div>
						<div className="flex flex-col gap-2.5">
							<Label>Japanese Name</Label>
							<Input {...register("japaneseName")} />
						</div>
						<div className="flex flex-col gap-2.5">
							<Label>VA</Label>
							<Input {...register("VA")} />
						</div>
						<div className="flex flex-col gap-2.5">
							<Label>VA Japanese</Label>
							<Input {...register("japaneseVA")} />
						</div>
						<div className="flex flex-col gap-2.5">
							<Label>Age</Label>
							<Input {...register("age")} type="tel" />
						</div>
						<div className="flex flex-col gap-2.5">
							<Label>Icon</Label>
							<Input {...register("icon")} />
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
								<Input {...register("imageColor")} />
							</div>
						</div>
						<div className="flex flex-col gap-2.5">
							<Label>Birthday</Label>
							<div className="grid grid-cols-2 gap-2.5">
								<Combobox
									defaultValue={{
										value: getValues("birthdate")?.toString() ?? "1",
										label: getValues("birthdate")?.toString() ?? "1",
									}}
									items={dateList.map((val) => ({
										value: val.toString(),
										label: val.toString(),
									}))}
									onValueChange={(value) => {
										if (value === null) return;
										setValue("birthdate", +value.value);
									}}
								>
									<ComboboxInput placeholder="Birth Date" />
									<ComboboxContent>
										<ComboboxEmpty>No idol found.</ComboboxEmpty>
										<ComboboxList>
											{(item) => (
												<ComboboxItem key={item.value} value={item}>
													{item.label}
												</ComboboxItem>
											)}
										</ComboboxList>
									</ComboboxContent>
								</Combobox>
								<Combobox
									defaultValue={{
										value: getValues("birthmonth")?.toString() ?? "1",
										label: DateTime.fromFormat(
											getValues("birthmonth")?.toString() ?? "1",
											"M",
										).toFormat("LLLL"),
									}}
									items={[...Array(12)].map((_, idx) => ({
										value: (idx + 1).toString(),
										label: DateTime.fromFormat(
											(idx + 1).toString(),
											"M",
										).toFormat("LLLL"),
									}))}
									onValueChange={(value) => {
										if (value === null) return;
										setValue("birthmonth", +value.value);
									}}
								>
									<ComboboxInput placeholder="Birth Date" />
									<ComboboxContent>
										<ComboboxEmpty>No idol found.</ComboboxEmpty>
										<ComboboxList>
											{(item) => (
												<ComboboxItem key={item.value} value={item}>
													{item.label}
												</ComboboxItem>
											)}
										</ComboboxList>
									</ComboboxContent>
								</Combobox>
							</div>
						</div>
					</CardContent>
					<CardFooter>
						<Button type="submit" className="ml-auto ">
							Save
						</Button>
					</CardFooter>
				</Card>
			</form>
		</FormProvider>
	);
}
