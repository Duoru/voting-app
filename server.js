var express=require('express');
var config=require('./config');
var mongoose=require('mongoose');
var path = require('path');
var logger=require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app=express();

var mongoOptions = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };
mongoose.Promise = global.Promise;
mongoose.connect(config.DB_URL,mongoOptions);

app.use(logger('dev'));

app.set('view engine','ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var passport=require('passport');
var expressSession=require('express-session');
var MongoStore = require('connect-mongo')(expressSession);
app.use(expressSession({secret: 'SecretKey',
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({mongooseConnection: mongoose.connection}),
    cookie:{maxAge:365 * 24 * 60 * 60 * 1000}
}));
app.use(passport.initialize());
app.use(passport.session());

var flash=require('connect-flash');
app.use(flash());

var passportInit=require('./passport/init');
passportInit(passport);

app.use(function(req, res, next) {
    res.locals.logged = req.user;
    next();
});

var routes = require('./routes/index')(passport);
app.use('/', routes);

var port=process.env.PORT || 8080;

app.listen(port,function () {
    console.log("App listening on port " + port);
});
