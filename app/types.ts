import type { DateTime } from "luxon";

export enum UserType {
	NULL = 0,
	LOADING = 1,
	OK = 2,
	UNAUTHORIZED = 3,
}

export enum ROLE {
	NORMAL = 0,
	ADMIN = 1,
}

export type UserDto = {
	id: string;
	username: string;
	avatar: string;
	tag: string;
	role: ROLE;
	pid?: string | null;
};

export type UserData = {
	username: string;
	global_name: string;
	avatar: string;
	banner?: string;
	id: string;
	isJoinedServer: boolean;
	authType: UserType.OK;
	role: number;
};

export type UserState =
	| {
			authType: UserType.NULL;
	  }
	| {
			authType: UserType.LOADING;
	  }
	| UserData;

export interface UserFlairData {
	id: string;
	avatar: string;
	name: string;
	tag?: string;
}

export interface PostData {
	id: string;
	user: UserFlairData;
	content: string;
	time: string;
	images?: {
		url: string;
	}[];
	commentsCount: number;
}

export interface Comment {
	id: string;
	user: UserFlairData;
	content: string;
	postId: string;
}

export type Anime = {
	id: number;
	title?: string;
	titleJapanese?: string;
	sypnosis?: string;
	time?: DateTime;
	bg?: string;
	episodes?: AnimeEpisode[];
};

export type AnimeEpisode = {
	id: number;
	animeId: number;
	title?: string;
	index?: string;
	odr?: number;
};
