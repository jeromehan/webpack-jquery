//在pathmap.json 里面配置了commons.css的alias别名 commonCss
require('commonCss');
require('../css/index.scss');
var $ = require("jquery");
$("<div>这是jquery生成的</div>").appendTo("body");
