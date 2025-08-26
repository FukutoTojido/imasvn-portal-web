import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [
		tailwindcss(),
		reactRouter(),
		tsconfigPaths(),
		ViteImageOptimizer(),
	],
	ssr: {
		noExternal: ["react-easy-crop", "tslib"],
	},
	server: {
		host: "0.0.0.0"
	}
});
