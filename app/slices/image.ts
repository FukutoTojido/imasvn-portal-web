import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

const initialState: {
	images: { url: string }[];
	index: number;
} = {
	images: [],
	index: 0,
};

export const imageSlice = createSlice({
	name: "image",
	initialState,
	reducers: {
		setImages: (state, action: PayloadAction<typeof initialState>) => {
			state.images = action.payload.images;
			state.index = action.payload.index;
		},
	},
});

export const { setImages } = imageSlice.actions;
