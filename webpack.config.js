var path = require("path");
//var webpack = require('webpack');
var uglifyJsPlugin = require("webpack/lib/optimize/uglifyJsPlugin");

//console.log('path:::',path.join(__dirname, "./src/toast/"));

module.exports = {
  entry: {
    sticky: "./src/sticky/index.js",
    toast:"./src/toast/index.js",
    rem:"./src/rem-adaptive/index.js",
    scratch:"./src/scratch/index.js",
    progressbar:"./src/progressbar/index.js",
    animate:"./src/CSS3-animate/index.js"
  },
  output: {
    path: path.join(__dirname, "./build/js"),
    filename: "[name].bundle.js"
  },
  module: {
    loaders: [
      {
        loader: 'babel-loader',
        test: path.join(__dirname, "./src"),
        query: {
          presets: 'es2015',
        },
      }
    ]
  },
  plugins: [
    //提供全局的变量，在模块中使用无需用require引入
    // new webpack.ProvidePlugin({
    //     jQuery: "jquery",
    //     $: "jquery",
    //     // nie: "nie"
    // }),
    // //将公共代码抽离出来合并为一个文件
    // new CommonsChunkPlugin('common.js'),
    //js文件的压缩
    new uglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
	]
};