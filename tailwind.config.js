/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./App.tsx", "./screens/**/*.tsx", "./components/**/*.tsx"],
	theme: {
		extend: {
			colors: {
				primary: {
					50: "#F2F7F6",
					100: "#E6F0EE",
					200: "#CCE0DC",
					300: "#B6D3CD",
					400: "#9DC3BC",
					500: "#83B4AA",
					600: "#5E9C8F",
					700: "#47766C",
					800: "#2E4C46",
					900: "#172623",
					950: "#0C1312",
				},
			},
		},
		plugins: [],
	},
};
