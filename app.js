/**
 * Main module
 */

require('dotenv').config({path: `${__dirname}/.env`});

var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const cors = require('cors');

var routes = require('./routes/index');

var app = express();

const mongoose = require('mongoose');
const config = require('./config');
const db = require('./helpers/db');

global.Promise = require('bluebird');
global.Promise.config({ cancellation: true });

/** Setup mongoose */
mongoose.Promise = global.Promise;
mongoose.connect(config.database);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err.status,
  });
});

// Generate stats
db.getNewStats()
  .then(() => {
    console.log('New stats were generated!');
  })
  .catch(err => console.error(err));
setInterval(() => {
  db.getNewStats()
    .then(() => {
      console.log('New stats were generated!');
    })
    .catch(err => console.error(err));;
}, 300000);

console.log('Server is up and running!');

module.exports = app;
