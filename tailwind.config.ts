import type { Config } from "tailwindcss";

const config: Config = {
	content: ["./app/**/**/*.{js,ts,jsx,tsx,mdx}"],
	theme: {
		extend: {
			backgroundImage: {
				"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
				"gradient-conic":
					"conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
			},
			colors: {
				"primary-1": "#25263A",
				"primary-2": "#2B2C43",
				"primary-3": "#363753",
				"primary-4": "#56587d",
				"primary-4.5": "#a3a5c7",
				"primary-5": "#BDBFE3",
				"primary-6": "#DBDCFF",
				"alt-accent": "#ff9752",
				"alt-bg": "#f5ddce",
				"alt-subtle": "#fdd7bd48",
				red: "#EC708E",
				yel: "#FCD980",
				gre: "#95E494",
				cya: "#83CDF6",
				cri: "#F85656",
				gol: "#FBD267",
				mid: "#5EEC64",
				blu: "#3E9FF9",
			},
		},
	},
	plugins: [],
};
export default config;
