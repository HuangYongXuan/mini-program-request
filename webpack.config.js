const path = require('path');

module.exports = {
	entry: './src/index.ts',
	devtool: "source-map",
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
		process: false,
	}
};