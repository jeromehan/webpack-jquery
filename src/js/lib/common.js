var $=require('jquery')
import header from '@/components/header/header.js'//头部组件
import footer from '@/components/footer/footer.js'//尾部组件
var header_tpl=new header()
var footer_tpl=new footer()
$('.header_top').html(header_tpl.tpl({
  name:'我是头部'       //头部加到目标节点
}))
$('.footer_bottom').html(footer_tpl.tpl({
  name:'我是尾部'
}))
