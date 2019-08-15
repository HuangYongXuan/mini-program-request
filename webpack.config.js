const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: './src/index.ts',
	devtool: 'source-map',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/
			}
		]
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
		alias: {
			'@': './src/'
		}
	},
	output: {
		filename: 'axios.js',
		path: path.resolve(__dirname, 'dist'),
		sourceMapFilename: 'axios.js.map',
		library: 'axios',
		libraryTarget: 'umd'
	},
	node: {
		process: false
	},
	devServer: {
		contentBase: path.join(__dirname, 'dist'),
		compress: true,
		port: 9000,
		index: 'index.html',
	},
	plugins: [
		new HtmlWebpackPlugin()
	]
};