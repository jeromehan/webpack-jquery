'use strict';

var webpack = require("webpack");
var path = require("path");
var glob = require('glob')

//路径定义
var srcDir = path.resolve(process.cwd(), 'src');
var distDir = path.resolve(process.cwd(), 'dist');
var nodeModPath = path.resolve(__dirname, './node_modules');
var publicPath = '/';//发布到服务器的文件夹
//插件定义
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin
var cleanWebpackPlugin = require('clean-webpack-plugin');

//入口文件定义
var entries = function () {
    var jsDir = path.resolve(srcDir, 'js')
    var entryFiles = glob.sync(jsDir + '/*.{js,jsx}')
    var map = {};

    for (var i = 0; i < entryFiles.length; i++) {
        var filePath = entryFiles[i];
        var filename = filePath.substring(filePath.lastIndexOf('\/') + 1, filePath.lastIndexOf('.'));
        map[filename] = filePath;
    }
    return map;
}
//html_webpack_plugins 定义
var html_plugins = function () {
    var entryHtml = glob.sync(srcDir + '/*.ejs')
    var r = []
    var entriesFiles = entries()
    for (var i = 0; i < entryHtml.length; i++) {
        var filePath = entryHtml[i];
        var filename = filePath.substring(filePath.lastIndexOf('\/') + 1, filePath.lastIndexOf('.'));
        var conf = {
            template:filePath,
            filename: filename + '.html'
        }
        //如果和入口js文件同名
        if (filename in entriesFiles) {
            conf.inject = 'body'
            conf.chunks = ['vendor', filename]
        }
        //跨页面引用，如pageA,pageB 共同引用了common-a-b.js，那么可以在这单独处理
        //if(pageA|pageB.test(filename)) conf.chunks.splice(1,0,'common-a-b')
        r.push(new HtmlWebpackPlugin(conf))
    }
    return r
}
module.exports = function(options){
    options = options || {}
    var debug = options.debug !==undefined ? options.debug :true;

    var plugins = [];

    var extractCSS;
    var cssLoader;
    var sassLoader;

    plugins.push(new CommonsChunkPlugin({
        name: 'vendor',
        minChunks: Infinity
    }),
    new webpack.ProvidePlugin({
        _: "js/lib/loadsh.js"
    })
  );

    if(debug){
        extractCSS = new ExtractTextPlugin({filename:'css/[name].[contenthash].css',allChunks: true})
        cssLoader = extractCSS.extract({use:['css-loader','autoprefixer-loader']})
        sassLoader = extractCSS.extract({use:['css-loader','autoprefixer-loader','sass-loader']})
        plugins.push(extractCSS)
    }else{
        extractCSS = new ExtractTextPlugin({filename:'css/[contenthash:8].[name].min.css',
            // 当allChunks指定为false时，css loader必须指定怎么处理
            allChunks:true
        })
        cssLoader = extractCSS.extract({use:[{
                loader: 'css-loader',
                options: {
                    // If you are having trouble with urls not resolving add this setting.
                    // See https://github.com/webpack-contrib/css-loader#url
                    url: false,
                    minimize: true,
                }
            },{
              loader:'autoprefixer-loader'
            }]
          })
        sassLoader = extractCSS.extract({use:[{
                loader: 'css-loader',
                options: {
                    // If you are having trouble with urls not resolving add this setting.
                    // See https://github.com/webpack-contrib/css-loader#url
                    url: false,
                    minimize: true,
                }
            },
            'autoprefixer-loader',
            'sass-loader']
         })
        plugins.push(
            extractCSS,
            new cleanWebpackPlugin(['dist/*'], {
              root: path.resolve(__dirname)
            }),
            new UglifyJsPlugin({
              uglifyOptions:{
                compress: {
                    warnings: false
                },
                output: {
                    comments: false
                },
                mangle: {
                    except: ['$','_','exports', 'require']
                }
              }
            }),
            new webpack.NoEmitOnErrorsPlugin()
        )
    }

    //config
    var config = {
        entry: Object.assign(entries(), {
            // 用到什么公共lib（例如jquery.js），就把它加进vendor去，目的是将公用库单独提取打包
            'vendor': ['jquery','_']
        }),
        output: {
            path: path.join(__dirname, "dist"),
            filename: "js/[name].[hash].js",
            chunkFilename: '[chunkhash:8].chunk.js',
            publicPath: publicPath
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    // include: [srcDir]
                },
                {
                    test: /\.((woff2?|svg)(\?v=[0-9]\.[0-9]\.[0-9]))|(woff2?|svg|jpe?g|png|gif|ico)$/,
                    use: [
                        //小于10KB的图片会自动转成dataUrl，
                        'url-loader?limit=10000&name=img/[hash:8].[name].[ext]'
                    ]
                },
                {
                    test: /\.((ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9]))|(ttf|eot)$/,
                    use: 'url-loader?limit=10000&name=fonts/[hash:8].[name].[ext]'
                },
                {test: /\.(tpl|ejs)$/,use: 'ejs-loader'},
                {test: /\.css$/,use:cssLoader},
                {test:/\.scss$/,use:sassLoader}
            ]
        },
        resolve: {
            extensions: ['.js', '.css', '.scss', '.tpl', '.png', '.jpg'],
            modules:[srcDir, nodeModPath],
            alias:{
              "_":"js/lib/loadsh.js",
              "zepto": "js/lib/zepto.js",
              "jquery": "js/lib/jquery-1.12.4.js",
              'common':'js/lib/common.js',
              "commonCss":"css/common.css",
              '@':path.join(__dirname,'src')
            }
        },
        plugins: plugins.concat(html_plugins())
    }

    return config;
}
