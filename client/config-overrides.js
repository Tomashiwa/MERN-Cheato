const { webpackAliases } = require("react-scripts/config/modules");

module.exports = function override(config, env) {
	const optimization = {
		...config.optimization,
		...{
			// splitChunks: {
			// 	chunks: "all",
			// 	name: false,
			// 	cacheGroups: {
			// 		// default: {
			// 		// 	minChunks: 2,
			// 		// 	priority: -20,
			// 		// 	reuseExistingChunk: true,
			// 		// },
			// 		konva: {
			// 			name: "konva",
			// 			test: /[\\/]node_modules[\\/](\b\w*konva\w*\b)[\\/]/,
			// 			chunks: "all",
			// 		},
			// 		axios: {
			// 			name: "axios",
			// 			test: /[\\/]node_modules[\\/]axios[\\/]/,
			// 			chunks: "all",
			// 		},
			// 		react: {
			// 			name: "react",
			// 			test: /[\\/]node_modules[\\/]((react).*)[\\/]/,
			// 			chunks: "all",
			// 		},
			// 		// common: {
			// 		// 	name: "common",
			// 		// 	test: /[\\/]node_modules[\\/]/,
			// 		// 	chunks: "all",
			// 		// },
			// 	},
			// },
		},
	};

	// console.log({ ...config, ...{ optimization } });

	// plugins.splice(plugins.length, 0, new webpack.AutomaticPrefetchPlugin());
	return { ...config, ...{ optimization } };
};
