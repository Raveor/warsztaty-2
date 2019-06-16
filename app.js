﻿'use strict';
var debug = require('debug');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');
var db = require('./scripts/DatabaseConnection');
global.__root = __dirname + '/';

var routes = require('./routes');
var users = require('./routes/users');
var login = require('./routes/login');
var auth = require('./routes/auth');
var expeditions = require('./routes/expeditions');
var shop = require('./routes/shop');
var character = require('./routes/character');
var clan = require('./routes/clan');
var admin = require('./routes/admin');
var test = require('./routes/test'); //ONLY FOT TESTS

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'client/build')));
app.use(cors());

app.use('/', routes);
app.use('/users', users);
app.use('/login', login);
app.use('/auth', auth);
app.use('/expeditions', expeditions);
app.use('/shop', shop);
app.use('/character', character);
app.use('/clan', clan);
app.use('/admin', admin);
app.use('/test', test);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`Password generator listening on ${port}`);
