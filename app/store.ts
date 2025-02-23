import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./slices/auth";
import { imageSlice } from "./slices/image";
import { postSlice } from "./slices/post";

export default configureStore({
	reducer: {
		auth: authSlice.reducer,
		image: imageSlice.reducer,
		post: postSlice.reducer,
	},
});
