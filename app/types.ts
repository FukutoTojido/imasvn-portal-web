export enum UserType {
	NULL = 0,
	LOADING = 1,
	OK = 2,
	UNAUTHORIZED = 3,
}

export type UserState =
	| {
			authType: UserType.NULL;
	  }
	| {
			authType: UserType.LOADING;
	  }
	| {
			username: string;
			global_name: string;
			avatar: string;
			banner?: string;
			id: string;
			isJoinedServer: boolean;
			authType: UserType.OK;
	  };

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
	postId: string
}