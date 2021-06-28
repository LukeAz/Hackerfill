'use strict';
const router = require('express').Router();
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const argon2i = require('../controllers/argon2i');
const auth = require('../controllers/auth');
const query = require('../db/query');

router.get('/', auth.isAuthorized, csrfProtection, (req, res) => {
  if(req.user === undefined) 
    res.redirect('/'); 
  else 
    res.render('privateProfile', {params: {page: 'profile', logged:1, user: req.user}, csrfToken: req.csrfToken()}); 
});

router.post('/edit/data', auth.isAuthorized, csrfProtection, (req, res) => {
  let mailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  let usernameNameSurnameRegex = /^[\w'\-,.][^_!¡?÷?¿/\\+=@#$%ˆ&*(){}|~<>;:[\]]{1,20}$/;

  if(req.user === undefined) 
    res.json({status: false, message: 'Unauthorized 403'});
  else {
    if(!usernameNameSurnameRegex.test(req.body.surname) || !usernameNameSurnameRegex.test(req.body.name))
      res.json({status: false, message: 'The length of the name and surname must be between 2 and 20 characters, maybe you have inserted a forbidden symbol'});
    else if(!mailRegex.test(req.body.email))
      res.json({status: false, message: 'Invalid email format!'});
    else {
      query.updateAccount(req.user.username, req.body.name, req.body.surname, req.body.email, req.body.biografy, req.body.imageprofile).then(() => {
        res.json({status: true, message: ''});
      }).catch(() => res.json({status: false, message: 'Email already in use or generic error, please try again.'}));
    }
  }
});

router.post('/edit/password', auth.isAuthorized, csrfProtection, (req, res) => {
  let passwordRegex = /(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*-_\\/\[\]]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

  if(req.user === undefined) 
    res.json({status: false, message: 'Unauthorized 403'});
  else if(req.body.password != req.body.passwordCheck)
    res.json({status: false, message: 'Passwords do not match'});
  else if(!passwordRegex.test(req.body.password))
    res.json({status: false, message: 'The password length must be greater than or equal to 8, must contain one or more uppercase and lowercase and numeric characters and one of this special characters: [!@#$%^&*-_\/]!'});
  else {
    query.getUserPassword(req.user.username).then((hash) => {
      argon2i.verify(req.body.passwordOld, hash).then((boolean) => {
        if(boolean) {
          argon2i.hash(req.body.password).then((hash) => {
            query.updatePassword(req.user.username, hash).then(() => {
              res.json({status: true, message: ''});
            }).catch(() => res.json({status: false, message: 'Error, password has not been changed'}));
          }).catch(() => res.json({status: false, message: 'Error hashing'}));   
        } else {
          res.json({status: false, message: 'The old password you entered is not correct.'});
        }
      }).catch(e => res.json({status: false, message: 'The old password you entered is not correct.'}));
    }).catch(e => res.json({status: false, message: 'Unauthorized 403'}));
  }
});

router.post('/delete', auth.isAuthorized, csrfProtection, (req, res, next) => {
  if(req.user === undefined) 
    next(e);
  else {
    query.deleteAccount(req.user.username, req.user.role).then(() => {
      res.clearCookie('access_token');
      res.redirect('/');
    }).catch(e => next(e));
  }
});

module.exports = router;