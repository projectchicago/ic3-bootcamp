const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
	mode: 'development',
	entry: './src/index.js',
	output: {
  		filename: 'bundle.js',
  		path: path.resolve(__dirname, 'dist')
	},
	devServer: {
     	contentBase: './dist'
   	},
   	plugins: [
    	new HtmlWebpackPlugin({
    		title: "Demo"
    	}),
    	new webpack.ProvidePlugin({
        	d3: 'd3'
        })
   	],
   	module: {
    	rules: [{
         	test: /\.css$/,
         	use: [
           		'style-loader',
           		'css-loader'
         	]
       	},
 		{
			test: /\.(csv|tsv)$/,
        	use: [
           		'csv-loader'
         	]
	    },
       	{
	        test: /\.(woff|woff2|eot|ttf|otf)$/,
         	use: [
	           	'file-loader'
         	]
       }]
   	}
}