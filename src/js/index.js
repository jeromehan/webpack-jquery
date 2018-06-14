//在pathmap.json 里面配置了commons.css的alias别名 commonCss
var $ = require("jquery");
require('commonCss');
require('../css/index.scss');
require('./lib/common.js')//引入公共布局
$("<div>这是jquery生成的</div>").appendTo("body");
