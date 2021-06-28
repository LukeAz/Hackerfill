'use strict';
const jwt = require('./rs256jwt');
const query = require('../db/query');

module.exports = {
  isAuthorized: (req, res, next) => {
    if(!req.cookies.access_token) {
      next();
    } else {
      jwt.verify(req.cookies.access_token).then((payload) => {
        query.getUserData(payload.username, payload.role).then(user => {
          if(user != undefined) {
            user.role = payload.role;
            req.user = user;
            next();
          } else
            next('Unauthorized');
        }).catch(e => next(e));
      }).catch(e => next(e));
    }
  }   
}