'use strict';
const router = require('express').Router();
const argon2i = require('../controllers/argon2i');
const jwt = require('../controllers/rs256jwt');
const query = require('../db/query');
const auth = require('../controllers/auth');

router.get('/', auth.isAuthorized, (req, res) => {
  if(req.user === undefined)
    res.render('index', {params: {page: 'index', logged: 0}});
  else 
    res.render('index', {params: {page: 'index', logged: 1, user: req.user}});
});

router.post('/leaderboard', (req, res) => {
  query.leaderboard().then((leaderboard) => {
    res.json({status: true, message: "Here are the top six highest rated articles.", leaderboard: leaderboard});
  }).catch(() => res.json({status: false, message: "I can't retrieve the data from the server.", leaderboard: []}));
});

router.get('/login', (req, res) => {
  if(req.cookies.access_token)
    res.redirect('/');
  else
    res.render('login', {params: {page: 'login', logged: 0}});
});

router.post('/login', (req, res) => {
  query.getUserPassword(req.body.username).then((hash) => {
    argon2i.verify(req.body.password, hash).then((boolean) => {
      if(boolean) {
        query.isAdvertiser(req.body.username).then(isAdv => {
          jwt.sign({username: req.body.username, role: (isAdv) ? 'advertiser' : 'reader'}).then((token) => {
            res.cookie('access_token', token, {httpOnly: true, secure: true, sameSite: 'Strict', expires: new Date(Date.now() + 7200000)});
            res.json({status: true, message: ""});
          }).catch(() => res.json({status: false, message: "Internal server error 500"}));
        }).catch(() => res.json({status: false, message: "Unauthorized 403"}));
      } else {
        res.json({status: false, message: "Wrong username or password."});
      }
    }).catch(() => res.json({status: false, message: "Wrong username or password."}));
  }).catch(() => res.json({status: false, message: "Wrong username or password."}));
});

router.get('/register', (req, res) => {
  if(req.cookies.access_token)
    res.redirect('/');
  else
    res.render('register', {params: {page: 'register', logged:0}});
});

router.post('/register', (req, res) => {
  let mailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  let passwordRegex = /(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*-_\\/\[\]]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
  let usernameNameSurnameRegex = /^[\w'\-,.][^_!¡?÷?¿/\\+=@#$%ˆ&*(){}|~<>;:[\]]{1,20}$/;

  if(req.body.password != req.body.passwordCheck)
    res.json({status: false, message: "Passwords do not match."});
  else if(!usernameNameSurnameRegex.test(req.body.username))
    res.json({status: false, message: "The length of the username must be between 2 and 20 characters, maybe you have inserted a forbidden symbol."});
  else if(!passwordRegex.test(req.body.password))
    res.json({status: false, message: "The password length must be greater than or equal to 8, must contain one or more uppercase and lowercase and numeric characters and one of this special characters: [!@#$%^&*-_\/]!"});
  else if(!mailRegex.test(req.body.email))
    res.json({status: false, message: "Invalid email format."});
  else if(!usernameNameSurnameRegex.test(req.body.name) || !usernameNameSurnameRegex.test(req.body.surname))
    res.json({status: false, message: "The length of the name and surname must be between 2 and 20 characters, maybe you have inserted a forbidden symbol."});
  else if(req.body.role != "advertiser" && req.body.role !="reader")
    res.json({status: false, message: "Error, malformed role."});
  else {
    argon2i.hash(req.body.password).then((hash) => {
      query.addAccount(req.body.username,req.body.email,req.body.name,req.body.surname,hash,req.body.role).then(() => {
        jwt.sign({username: req.body.username, role: req.body.role}).then((token) => {
          res.cookie('access_token', token, {httpOnly: true, secure: true, sameSite: 'Strict', expires: new Date(Date.now() + 7200000)});
          res.send({status: true, message: ""});
        }).catch(() => res.json({status: false, message: "Internal server error 500"}));
      }).catch(() => res.json({status: false, message: "Username or email already in use."}));
    }).catch(() => res.json({status: false, message: "Internal server error 500"}));
  }
});

router.get('/about', auth.isAuthorized, (req, res) => {
  if(req.user === undefined)
    res.render('about', {params: {page: 'index', logged: 0}});
  else 
    res.render('about', {params: {page: 'index', logged: 1, user: req.user}});
});

router.get('/logout', (req, res) => {
  res.clearCookie('access_token');
  res.redirect('/');
});

module.exports = router;