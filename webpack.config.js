var path = require("path");
var uglifyJsPlugin = require("webpack/lib/optimize/uglifyJsPlugin");

console.log('path:::',path.join(__dirname, "./src/toast/"));

module.exports = {
  entry: "./src/toast/index.js",
  output: {
    path: path.join(__dirname, "./src/toast/"),
    filename: "index.bundle.js"
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: "style!css" }
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