require('../css/pageA.css');
var $ = require("jquery");
$("<div>这是jquery生成的多页面示例</div>").appendTo("body");
require('@/components/header/header.js')//引入header组件
require('@/components/footer/footer.js')//引入footer组件
