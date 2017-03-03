/**
 * Created by Alexander on 13/Feb/2017.
 */
var express=require('express');
var Pull=require('../models/pull');
var router=express.Router();

module.exports=function (passport) {

    var isAuthenticated=function (req,res,next) {
        if(req.isAuthenticated()){
            return next();
        }
        res.redirect('/');
    };

    router.get('/', function(req, res) {
        if(!req.session.votes){
            req.session.votes=[];
        }
        if(req.isAuthenticated()){
            res.redirect('home');
        }else {
            Pull.find().sort({_id:-1}).limit(10).exec(function(err, data){
                if(err){
                    console.log(err);
                    res.render('pages/index');
                }else{
                    res.render('pages/index',{
                       data:data
                    });
                }
            });
        }
    });

    router.get('/login',function(req,res) {
        res.render('pages/login',{message: req.flash('message')});
    });

    router.post('/login', passport.authenticate('login', {
        successRedirect: 'home',
        failureRedirect: 'login',
        failureFlash : true
    }));

    router.get('/signup', function(req, res){
        res.render('pages/register',{message: req.flash('message')});
    });

    router.post('/signup', passport.authenticate('signup', {
        successRedirect: 'home',
        failureRedirect: 'signup',
        failureFlash : true
    }));

    router.get('/home', isAuthenticated, function(req, res){
        Pull.find().sort({_id:-1}).limit(10).exec(function(err, data){
            if(err){
                console.log(err);
                res.render('pages/home');
            }else{
                res.render('pages/home', {
                    user: req.user.name,
                    data:data
                });
            }
        });
    });
    router.get('/mypulls',isAuthenticated,function (req,res) {
        Pull.find({user:req.user.id}).sort({_id:-1}).exec(function (err, data) {
            if(err){
                console.log(err);
                res.redirect('/');
            }else{
                res.render('pages/mypulls',{
                    user:req.user.name,
                    data:data
                });
            }
        })
    });

    router.get('/mypulls/delete/:id',isAuthenticated,function (req,res) {
       Pull.remove({_id:req.params.id,user:req.user.id},function (err) {
           if(err){
               console.log(err);
               res.redirect('/');
           }else{
               res.redirect('/mypulls');
           }
       })
    });

    router.get('/new', isAuthenticated, function(req, res) {
        res.render('pages/newpull',{user:req.user.name});
    });

    router.post('/new', isAuthenticated, function (req,res) {
        var optionList=req.body.optionlist.split(/\r?\n/g);
        var optionObjects=[];

        optionList.forEach(function (item) {
          if(item!==""){
              var object={
                  name:item,
                  value:0
              };
              optionObjects.push(object);
          }
        });

        var newPull=new Pull();
        newPull.user=req.user.id;
        newPull.title=req.body.title;
        newPull.options=optionObjects;
        newPull.count=0;
        newPull.save(function (err) {
            if(err){
                console.log(err);
            }else{
                res.redirect('/pull/'+newPull.id);
            }

        });
    });

    router.get('/pull/:id',function (req,res) {
        var pull=require('../models/pull');
        var user="";
        var description="";
        if(req.isAuthenticated()){
            user=req.user.name;
        }
        pull.findOne({_id:req.params.id},function (err,data) {
            if(err){
                return console.log(err);
            }else{
                var options=data.options;
                for(var i=0;i<options.length;i++){
                    description +=options[i].name + " ";
                }
                res.render('pages/pull',{
                    user:user,
                    id:req.params.id,
                    title:data.title,
                    description:description,
                    data:data.options,
                    url:req.get('host')+req.originalUrl,
                    votes:req.session.votes
                });
            }
        });
    });

    router.post('/pull/vote',function (req,res) {
        if(req.body.id){
            Pull.findById(req.body.id,function (err,data) {
                if(err){
                    return console.log(err);
                }else{
                    var options=data.options;
                    var count=data.count;
                    if(req.body.textoption !==""){
                        options.push({name:req.body.textoption,value:1});
                        count+=1;
                    }else{
                        options[req.body.vote].value +=1;
                        count+=1;
                    }
                    data.options=options;
                    data.count=count;
                    data.save(function (err) {
                        if(err){
                            return console.log(err);
                        }else{
                            req.session.votes.push(req.body.id);
                            res.redirect('/pull/'+req.body.id);
                        }
                    })
                }
            });
        }
    });

    router.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    return router;
};
