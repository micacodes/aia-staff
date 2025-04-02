module.exports = function (api) {
	api.cache(true);
	return {
		presets: ["babel-preset-expo"],
		plugins: [
			"formatjs",
			"nativewind/babel",
			"react-native-reanimated/plugin",
		],
	};
};
