import tpl from './footer.ejs';
require('./footer.css')
function footer() {
    return {
        name:'footer',
        tpl: tpl
    }
};

export default footer;
