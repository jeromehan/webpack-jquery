import tpl from './header.ejs';
require('./header.css')
function header() {
    return {
        name:'header',
        tpl: tpl
    }
};
export default header;
