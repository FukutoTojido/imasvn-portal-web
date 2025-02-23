import { createSlice } from "@reduxjs/toolkit";

const initialState: {
	show: boolean;
} = {
	show: false,
};

export const postSlice = createSlice({
	name: "post",
	initialState,
	reducers: {
		show: (state) => {
			state.show = true;
		},
		hide: (state) => {
			state.show = false;
		},
	},
});

export const { show, hide } = postSlice.actions;
