/**
 * Created by Alexander on 15/Feb/2017.
 */
var mongoose = require('mongoose');

var pullSchema=mongoose.Schema({
    user:String,
    title:String,
    options:[{name:String,value:Number}],
    count:Number
});

module.exports=mongoose.model("Pull", pullSchema);