export type CharacterData = {
	Name: string;
	"Voice Actor"?: string;
	Birthday?: {
		month: number;
		day: number;
	};
	"Image Color"?: string;
	Character: string;
	ImgURL: string;
	Index: number;
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