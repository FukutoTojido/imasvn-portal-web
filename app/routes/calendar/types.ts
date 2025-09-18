export type CharacterData = {
	name: string;
	japaneseName?: string;
	VA?: string;
	japaneseVA?: string;
	birthdate?: number;
	birthmonth?: number;
	imageColor?: string;
	icon: string;
	id: number;
	age: number;
};

export type RefList = {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	card: any;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	avatar: any;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	character: any;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	name: any;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	description: any;
};
