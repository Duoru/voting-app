/**
 * Created by Alexander on 13/Feb/2017.
 */
var login=require('./login');
var signup=require('./signup');
var User=require('../models/user');

module.exports=function (passport) {
    passport.serializeUser(function (user,done) {
        console.log('serializing user: ');
        console.log(user);
        done(null,user.id);
     });

    passport.deserializeUser(function (id,done) {
        User.findById(id,function(err,user){
            console.log('deserializing user:' +user);
            done(err,user);
        });
    });

    login(passport);
    signup(passport);
};