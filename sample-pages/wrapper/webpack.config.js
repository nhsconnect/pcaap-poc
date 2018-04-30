const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const { ProvidePlugin } = require("webpack");
const { TsConfigPathsPlugin, CheckerPlugin } = require("awesome-typescript-loader");

const outDir = path.resolve(__dirname, "dist");
const srcDir = path.resolve(__dirname, "src");
const nodeModulesDir = path.resolve(__dirname, "node_modules");
const baseUrl = "/";

module.exports = {
    resolve: {
        extensions: [".ts", ".js"],
        modules: [srcDir, "node_modules"],
    },
    entry: `${srcDir}/index.ts`,
    output: {
        filename: "bundle.js",
        path: outDir,
        publicPath: baseUrl,
        libraryTarget: "var",
        library: "EntryPoint"
    },
    devtool: "source-map",
    mode:"development",
    module: {
        rules: [
            { test: /\.ts$/i, loader: "awesome-typescript-loader", exclude: nodeModulesDir }
        ]
    },
    plugins: [
        new TsConfigPathsPlugin(),
        new CheckerPlugin(),
        new CleanWebpackPlugin([outDir]),
        new HtmlWebpackPlugin({template: "index.ejs"})
    ]
}