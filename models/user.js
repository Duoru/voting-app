/**
 * Created by Alexander on 13/Feb/2017.
 */
var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    name:String,
    username:String,
    password:String,
    email:String

});

module.exports = mongoose.model('User',userSchema);