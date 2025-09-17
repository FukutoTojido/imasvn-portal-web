export type Producer = {
	id: string;
	name: string;
};

export type Card = {
	id: string;
	name: string;
	img: string;
	title: string;
	pid: string;
	idol: string;
	idolJapanese?: string;
	event?: number;
};
