export type Message = {
	username: string;
	global_name: string;
	avatar: string;
	id: string;
	time: number;
	content: string;
};

export enum State {
	JOIN = "JOIN",
	LEAVE = "LEAVE",
}

export type JoinLeaveMessage = {
	username: string;
	state: State;
};

export enum SOCKET_ENUM {
	NEW_MESSAGE = "NEW_MESSAGE",
	UPDATE_USERCOUNT = "UPDATE_USERCOUNT",
	NEW_USER = "NEW_USER",
	USER_STATE = "USER_STATE",
}

export type Viewer = {
	username: string;
    id: string
};

export type Alert = {
	type: "OK" | "ERROR";
	message: string;
	timestamp: number,
};
