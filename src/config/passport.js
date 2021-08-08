var LocalStrategy = require('passport-local').Strategy;
// load  user model
var User = require('../models/user');
module.exports = function (passport) {

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findByPk(id, function(err, user){
            done(err, user);
        });;
    })

    passport.use('user-signup', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function(req, email, password, done){
            process.nextTick(function(){
                User.findOne({'user_email': email}, function(err, user){
                    if(err)
                        return done(err);
                    if(user){
                        return done(null, false, req.flash('signupMessage','That email already taken.'));
                    } else{
                        var newUser = new User();
                        newUser.user.user_email=email;
                        newUser.user.user_password = newUser.generateHash(password);
                        newUser.save(function(err){
                            if(err)
                                throw err;
                            return done(null, newUser);
                        });
                    }    
                });
            });
        }
    ));
};