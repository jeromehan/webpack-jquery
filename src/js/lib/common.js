var data = require('@/data/data.js');
var inc = function(name, sendData){
return require('@/components/' + name + '.ejs')(sendData?{data:data.data} : null);
};
module.exports=inc
