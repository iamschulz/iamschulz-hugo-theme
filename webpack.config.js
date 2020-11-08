const path = require("path");
const WebpackAssetsManifest = require("webpack-assets-manifest");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
	.BundleAnalyzerPlugin;
const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");

module.exports = (env) => {
	return {
		mode: env.mode,
		entry: {
			index: "./helpers/entry/script.ts",
		},
		output: {
			path: path.resolve(__dirname, "static"),
			publicPath: "/",
			filename: "js/bundle.[chunkhash].js",
			chunkFilename: "js/[name].[chunkhash].js",
		},
		module: {
			rules: [
				{
					test: /\.js$/,
					exclude: /(node_modules)/,
					use: {
						loader: "babel-loader",
					},
				},
				{
					test: /\.ts$/,
					exclude: /(node_modules)/,
					use: {
						loader: "ts-loader",
					},
				},
				{
					test: /\.worker\.js$/,
					use: { loader: "worker-loader" },
				},
				{
					test: /\.(scss|sass|css)$/,
					use: [
						MiniCssExtractPlugin.loader,
						{
							loader: "css-loader",
							options: {
								url: false,
								sourceMap: env.mode === "development",
							},
						},
						{
							loader: "sass-loader",
							options: { sourceMap: env.mode === "development" },
						},
					],
				},
				{
					test: /\.svg$/,
					loader: "file-loader",
					include: [path.resolve(__dirname, "assets/svg/public")],
					query: {
						limit: 1,
						name: "[name].[hash].[ext]",
					},
				},
			],
		},
		resolve: {
			extensions: [".ts", ".js", ".css", ".scss"],
		},
		devtool: "source-map",
		plugins: [
			new CleanWebpackPlugin(),
			new MiniCssExtractPlugin({
				filename: "css/styles.[chunkhash].css",
				chunkFilename: "css/[name].[chunkhash].css",
			}),
			new CopyPlugin([
				{ from: "assets/fonts", to: "fonts" },
				{ from: "assets/img", to: "img" },
			]),
			new FixStyleOnlyEntriesPlugin(),
			new BundleAnalyzerPlugin({
				analyzerMode: env.stats ? "static" : "disabled",
				openAnalyzer: env.stats,
				reportFilename: "report/index.html",
			}),
			new WebpackAssetsManifest({
				output: "../data/assetManifest.json",
			}),
		],
	};
};
