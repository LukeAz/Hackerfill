'use strict';
const config = require('./config/config.json');
const https = require('https');
const fs = require('fs');
const myCaKey = fs.readFileSync('config/myCa.key', 'utf8');
const myCaCrt = fs.readFileSync('config/myCa.crt', 'utf8');
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
app.use(express.json()); 
app.use(express.urlencoded({extended: false}));
app.use(express.static('public'));
app.disable('x-powered-by');
app.set('view engine', 'ejs');

//Initialize the database
require('./db/index').initialize();

//Import routes
const index = require('./routes/index');
const profile = require('./routes/profile');
const publicProfile = require('./routes/publicProfile');
const articles = require('./routes/articles');
app.use('/', index);
app.use('/profile', profile);
app.use('/public', publicProfile);
app.use('/articles', articles);

//Error handler
app.use((err, req, res, next) => {
  if(err == 'userNotFound' || err == 'Unauthorized' || err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
    res.clearCookie('access_token');
    res.redirect('/login');
  } else if(err.code == "EBADCSRFTOKEN")
    res.render('error/error', {params: {page: 'error', messages: 'ForbiddenError: invalid csrf token'}});
  else {
    console.log(err);
    res.render('error/error', {params: {page: 'error', messages: 'Something is broken!'}});
  }
});

https.createServer({key: myCaKey, cert: myCaCrt}, app).listen(config.PORT, () => {
  console.log("Server running on https://127.0.0.1:" + config.PORT);
});

//Default response
app.all('*', (req, res) => {
  res.status(403).render('error/error', {params: {page: 'error', messages: "This page doesn't exist!"}});
});
  