// const HtmlWebpackPlugin = require("html-webpack-plugin");
const PreloadWebpackPlugin = require('preload-webpack-plugin');

module.exports = function override(config, env) {
	config.plugins.push(
		// new HtmlWebpackPlugin(),
		new PreloadWebpackPlugin({
			rel: "preload",
			include: ["precache-manifest"]
		})
	);

	return config;
};
