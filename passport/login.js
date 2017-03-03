/**
 * Created by Alexander on 13/Feb/2017.
 */
var LocalStrategy=require('passport-local');
var User=require('../models/user');
var bCrypt=require('bcrypt-nodejs');

module.exports=function (passport) {

    passport.use('login', new LocalStrategy({
        passReqToCallback: true
    },
    function (req,username,password,done) {
        User.findOne({'username': username},
            function (err,user) {
                if (err) {
                    return done(err);
                }

                if (!user) {
                    console.log('User not Found with username ' + username);
                    return done(null, false, req.flash('message', 'User Not found'));
                }

                if (!validPassword(user, password)) {
                    console.log('Invalid Password');
                    return done(null, false, req.flash('message', 'Invalid Password'));
                }

                return done(null, user);
            }
        )
    })
    );

    var validPassword=function (user,password) {
        return bCrypt.compareSync(password, user.password);
    }
};