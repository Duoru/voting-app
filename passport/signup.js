/**
 * Created by Alexander on 13/Feb/2017.
 */
var LocalStrategy=require('passport-local').Strategy;
var User=require('../models/user');
var bCrypt=require('bcrypt-nodejs');

module.exports=function (passport) {
passport.use('signup',new LocalStrategy({
    passReqToCallback: true
},
function (req,username,password,done) {
    findOrCreateUser=function () {
        User.findOne({'username':username}, function (err,user) {
            if(err){
                console.log('Error in Signup:' +err);
                return done(err);
            }

            if(user){
                console.log('User already exists with user: '+username);
                return done(null, false, req.flash('message','User Already Exists'));
            }else{
                var newUser=new User();

                newUser.name=req.body.name;
                newUser.username=req.body.username;
                newUser.password=createHash(password);
                newUser.email=req.body.email;

                newUser.save(function (err) {
                    if(err){
                        console.log('Error in Saving user: '+err);
                        throw err;

                    }

                    console.log('User Registration successful');
                    return done(null, newUser);
                })
            }
        })
    };
    process.nextTick(findOrCreateUser);
 })

);
    var createHash = function(password){
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    }
};