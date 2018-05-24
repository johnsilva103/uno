const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const { VueLoaderPlugin } = require("vue-loader");
const WebpackMd5Hash = require("webpack-md5-hash");

const path = require("path");
const webpack = require("webpack");

const production = process.env.NODE_ENV === "production";
const fs = require("fs");

module.exports = {
	mode: process.env.NODE_ENV,
	entry: {
		app: [
			"babel-polyfill",
			path.resolve(__dirname, "app", "main.js"),
			path.resolve(__dirname, "app", "main.scss")
		]
	},
	output: {
		filename: production ? "app.[chunkhash].js" : "app.js",
		path: path.resolve(__dirname, "public")
	},
	resolve: {
		alias: { vue$: "vue/dist/vue.esm.js" },
		extensions: [".js", ".vue"]
	},
	module: {
		rules: [{
			test: /\.vue$/,
			loader: "vue-loader"
		}, {
			test: /\.js$/,
			exclude: /(node_modules)/,
			use: {
				loader: "babel-loader",
				options: {
					presets: ["env"],
					comments: false
				}
			}
		}, {
			test: /\.scss$/,
			include: [
				/node_modules/,
				path.resolve(__dirname, "app")
			],
			use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"]
		}, {
			test: /\.(woff|woff2|eot|ttf|otf|png|svg|jpe?g|gif)$/,
			loader: "file-loader"
		}]
	},
	plugins: [
		new webpack.DefinePlugin({ "process.env": { NODE_ENV: `'${process.env.NODE_ENV}'` } }),
		new MiniCssExtractPlugin({ filename: path.join(production ? "app.[chunkhash].css" : "app.css") }),
		new VueLoaderPlugin(),
		new CopyWebpackPlugin([{
			from: "app/static",
			to: "static"
		}]),
		function () {
			this.plugin("done", stats => {
				stats = stats.toJson();
				Object.keys(stats.entrypoints).forEach(entry => {
					const outputFolder = path.resolve(stats.outputPath, entry, "..");
					const cssFile = path.basename(stats.entrypoints[entry].assets.find(asset => path.extname(asset) === ".css"));
					const jsFile = path.basename(stats.entrypoints[entry].assets.find(asset => path.extname(asset) === ".js"));

					fs.writeFileSync(path.resolve(outputFolder, "app.html"),
						fs.readFileSync(path.resolve(__dirname, "app", "index.html"), "utf8")
							.replace("{{css}}", `/${cssFile}`)
							.replace("{{js}}", `/${jsFile}`)
					);
				});
			});
		}
	]
};

if(production) {
	module.exports.plugins.push(
		new UglifyJsPlugin(),
		new WebpackMd5Hash()
	);
}
