'use strict';

const router = require('express').Router();
const auth = require('../controllers/auth');
const query = require('../db/query');

router.get('/', auth.isAuthorized, (req, res, next) => {
  let username = (req.query.username != undefined && req.query.username != '') ? (req.query.unique == 'true') ? req.query.username : `%${req.query.username}%` : '%';
  let page = Number(req.query.page).toFixed(0);

  query.findAdvertiserProfiles(username, (!isNaN(page) && page > 0) ? page : 1).then((profiles) => {
    if(req.user === undefined) 
      res.render('publicProfiles', {params: {page: 'publicProfile', logged:0, query: req.query, publicProfile: profiles.list, np: (Math.ceil(profiles.ntot / 4)), pa: (page > 0) ? page : 1}}); 
    else 
      res.render('publicProfiles', {params: {page: 'publicProfile', logged:1, user: req.user, query: req.query, publicProfile: profiles.list, np: (Math.ceil(profiles.ntot / 4)), pa: (page > 0) ? page : 1}}); 
  }).catch((e) => next(e));
});

module.exports = router;

