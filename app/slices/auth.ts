import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import { type UserState, UserType } from "~/types";
import Cookies from "universal-cookie";

const initialState: {
	user: UserState;
} = {
	user: {
		authType: UserType.LOADING,
	},
};

export const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setUser: (
			state: {
				user: UserState;
			},
			action: PayloadAction<UserState>,
		) => {
			state.user = action.payload;
		},
		logOut: (state) => {
			state.user.authType = UserType.NULL;
		},
	},
});

export const { setUser, logOut } = authSlice.actions;
