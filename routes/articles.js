'use strict';
const router = require('express').Router();
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const path = require('path');
const auth = require('../controllers/auth');
const query = require('../db/query');
const fileUtility = require('../controllers/fileUtility');

router.get('/', auth.isAuthorized, csrfProtection, (req, res, next) => {
  let username = (req.query.username != undefined && req.query.username != '') ? (req.query.unique == 'true') ? req.query.username : `%${req.query.username}%` : '%';
  let category = (req.query.category != undefined && req.query.category != '') ? req.query.category : '%';
  let title = (req.query.title != undefined && req.query.title != '') ? `%${req.query.title}%` : '%';
  let description = (req.query.description != undefined && req.query.description != '') ? `%${req.query.description}%` : '%';
  let text = (req.query.text != undefined && req.query.text != '') ? `%${req.query.text}%` : '%';
  let page = Number(req.query.page).toFixed(0);
  
  query.findArticles(username, category, title, description, text, (!isNaN(page) && page > 0) ? page : 1).then((articles) => {
    query.getCategory().then(categorys => {
      if(req.user === undefined) 
        res.render('articles/index', {params: {page: 'articles/index', logged: 0, articles: articles.list, categorys: categorys, query: req.query, np: (Math.ceil(articles.ntot / 4)), pa: (page > 0) ? page : 1}});
      else 
        res.render('articles/index', {params: {page: 'articles/index', logged: 1, user: req.user, articles: articles.list, categorys: categorys, query: req.query, np: (Math.ceil(articles.ntot / 4)), pa: (page > 0) ? page : 1}, csrfToken: req.csrfToken()});
    }).catch(e => next(e));
  }).catch(e => next(e)); 
});

router.get('/new', auth.isAuthorized, csrfProtection, (req, res) => {
  if(req.user === undefined || req.user.role == "reader") 
    next('failed');
  else
    query.getCategory().then((category) => res.render('articles/new', {params: {page: 'articles/new', logged: 1, user: req.user, category: category, messages: ''}, csrfToken: req.csrfToken()})).catch((e) => next(e));
});

router.post('/new', auth.isAuthorized, csrfProtection, (req, res) => {
  if(req.user === undefined || req.user.role == "reader")
    res.json({status: false, message: 'Unauthorized 403'});
  else {
    if(req.body.category != undefined && req.body.title != undefined && req.body.description != undefined && req.body.markdown != undefined) {
      query.getCategory().then(category => {
        if(category.filter(cat => cat.name == req.body.category).length == 1) {
          query.addArticle(req.user.username, req.body.category, req.body.title, req.body.description, req.body.markdown, req.body.image).then(() => {
            res.json({status: true});
          }).catch(() => res.json({status: false, message: 'Title already used in one of your articles.'}));
        } else
          res.json({status: false, message: 'Category not accepted.'});
      });
    } else
      res.json({status: false, message: 'Failure to send data.'});
  }
});

router.get('/edit/:articlesid', auth.isAuthorized, csrfProtection, (req, res, next) => {
  if(req.user === undefined || req.params.articlesid == undefined || req.user.role=="reader")
    next('failed');
  else {
    query.findArticle(req.params.articlesid).then((article) => {
      if(article != undefined && article.advertiserid == req.user.username)
        query.getCategory().then((category) => res.render('articles/edit', {params: {page: 'articles/edit', logged: 1, user: req.user, category: category, article: article, messages: ''}, csrfToken: req.csrfToken()})).catch((e) => next(e));
      else 
        next('failed');
    }).catch((e) => next(e));
  }
});

router.post('/edit/:articlesid', auth.isAuthorized, csrfProtection, (req, res) => {
  if(req.user === undefined || req.params.articlesid == undefined || req.user.role=="reader")
    res.json({status: false, message: 'Unauthorized 403'});
  else {
    query.findArticle(req.params.articlesid).then((article) => {
      if(article != undefined && article.advertiserid == req.user.username) {
        if(req.body.title === undefined || req.body.title == '' || req.body.description === undefined || req.body.description == '' || req.body.markdown === undefined ||req.body.markdown == '')
          res.json({status: false, message: 'Title, description or text not passed, please try again.'});
        else {
          query.updateArticle(req.params.articlesid, req.body.title, req.body.description, req.body.markdown, req.body.image).then(() => {
            res.json({status: true, message: ''});
          }).catch(() => res.json({status: false, message: 'Title already used in one of your articles.'}));
        }
      }
      else 
        res.json({status: false, message: 'Unauthorized 403'});
    }).catch(() => res.json({status: false, message: 'Unauthorized 403'}));
  }
});

router.post('/delete/:articlesid', auth.isAuthorized, csrfProtection, (req, res, next) => {
  if(req.user === undefined || req.params.articlesid == undefined || req.user.role=="reader")
    next('failed');
  else {
    query.findArticle(req.params.articlesid).then((article) => {
      if(article != undefined && article.advertiserid == req.user.username) 
        query.deleteArticle(req.params.articlesid).then(() => res.redirect('/articles')).catch((e) => next(e));
      else
        next('failed');
    }).catch((e) => next(e));
  }
})

router.post('/review/new/:articlesid', auth.isAuthorized, csrfProtection, (req, res) => {
  if(req.user === undefined || req.params.articlesid == undefined)
    res.json({status: false, message: 'Unauthorized 403'});
  else {
    query.findArticle(req.params.articlesid).then((article) => {
      if(article != undefined && article.advertiserid != req.user.username)  {
        if(req.body.title != "" && req.body.text != "" && req.body.stars > 0 && req.body.stars < 6) {
          query.addReview(req.user.username, req.params.articlesid, req.body.title, req.body.text, req.body.stars).then(() => {
            res.json({status: true, message: ''});
          }).catch(() => res.json({status: false, message: "You've already written a review to this article, you can't write another one. Please update the old one."}));
        } else
          res.json({status: false, message: 'The title, text, or number of stars contains an incorrect format.'});
      }
      else
        res.json({status: false, message: 'Unauthorized 403'});
    }).catch(() => res.json({status: false, message: 'Unauthorized 403'}));
  }
});

router.post('/review/edit/:articlesid', auth.isAuthorized, csrfProtection, (req, res) => {
  if(req.user === undefined || req.params.articlesid == undefined)
    res.json({status: false, message: 'Unauthorized 403'});
  else {
    query.findReview(req.user.username, req.params.articlesid).then((review) => {
      if(review != undefined) {
        if(req.body.title === undefined || req.body.title == "" || req.body.text === undefined || req.body.text == "" || req.body.stars === undefined || req.body.stars == "" || req.body.stars < 1 || req.body.stars > 5)
          res.json({status: false, message: 'Invalid title, description or stars numbers.'});
        else {
          query.updateReview(req.user.username, req.params.articlesid, req.body.title, req.body.text, req.body.stars).then(() => {
            res.json({status: true, message: ''});
          }).catch(() => res.json({status: false, message: 'Failure to update review.'}));
        }
      } else
        res.json({status: false, message: 'Unauthorized 403'});
    }).catch(() => res.json({status: false, message: 'Unauthorized 403'}));
  }
});

router.post('/review/delete/:articlesid', auth.isAuthorized, csrfProtection, (req, res, next) => {
  if(req.user === undefined || req.params.articlesid == undefined)
    next('failed');
  else {
    query.deleteReview(req.user.username, req.params.articlesid).then(() => {
      res.redirect(`/articles/${req.params.articlesid}`);
    }).catch(e => next(e));
  }
});

router.get('/upload/:articlesid', auth.isAuthorized, csrfProtection, (req, res, next) => {
  if(req.user === undefined || req.params.articlesid == undefined || req.user.role != "advertiser")
    next('failed');
  else {
    query.findArticle(req.params.articlesid).then(article => {
      if(article.advertiserid == req.user.username) {
        res.render('articles/upload', {params: {page: 'articles/upload', logged: 1, user: req.user, article: article, messages: ''}, csrfToken: req.csrfToken()});
      } else 
        next('failed');
    }).catch(e => next(e));
  }
});

router.post('/upload/:articlesid', auth.isAuthorized, csrfProtection, (req, res) => {
  fileUtility.fileUpload(req, res, (err) => {
    if(err || req.files.length == 0) {
      if(req.materialFileName != undefined)
        query.deleteMaterialError(req.params.articlesid, req.materialFileName).then(() => {
          res.json({status: false, message: 'One of the uploaded files exceeds the maximum size (50MB) or another problem, upload cancelled.'})
        }).catch(() => res.json({status: false, message: 'Unauthorized 403'}));
      else
        res.json({status: false, message: 'A file with the same name already exists, or there was an error in the server'});
    } else {
      fileUtility.checksumFile(req.files, req.params.articlesid).then(() => {
        res.json({status: true, message: ''});
      }).catch((e) => {
        res.json({status: true, message: ''});
      });
    }
  });  
});

router.post('/material/delete/:materialid', auth.isAuthorized, csrfProtection, (req, res, next) => {
  if(req.user === undefined || req.params.materialid === undefined)
    next('failed');
  else {
    query.findMaterial(req.params.materialid).then((material) => {
      if(material != undefined) {
        query.findArticle(material.articlesid).then((article) => {
          if(article.advertiserid == req.user.username) {
            query.deleteMaterial(article.articlesid, req.params.materialid, material.filepath).then(() => {
              res.redirect(`/articles/${article.articlesid}`);
            }).catch(e => next(e));
          } else 
            next('failed');
        }).catch(e => next(e));
      } else
        next('failed');
    }).catch(e => next(e));
  }
});

router.get('/material/:materialid', auth.isAuthorized, (req, res, next) => {
  if(req.user === undefined || req.params.materialid === undefined)
    next('failed');
  else {
    query.findMaterial(req.params.materialid).then((material) => {
      if(material != undefined) {
        if(material.filepath.split('.').pop() == 'pdf')
          res.contentType('application/pdf')
        
        res.sendFile(path.join(`${__dirname}/../articles/${material.articlesid}/${material.filepath}`));
      } else
        next("fileNotExist");
    }).catch((e) => next(e));
  }
});

router.get('/:articlesid', auth.isAuthorized, csrfProtection, (req, res, next) => {
  query.findArticle(req.params.articlesid).then((article) => {
    if(article == undefined)
      next('articleNotFound');
    else {
      let reviewFilter = (req.query.review == "my") ? req.user.username : undefined;
      query.findReviews(req.params.articlesid, reviewFilter).then((reviews) => {
        if(req.user === undefined)
          res.render('articles/view', {params: {page: 'articles/view', logged: 0, article: article, reviews: reviews, materials: []}});
        else
          query.findMaterials(req.params.articlesid).then((materials) => {
            res.render('articles/view', {params: {page: 'articles/view', logged: 1, user: req.user, article: article, reviews: reviews, materials: materials}, csrfToken: req.csrfToken()});
          }).catch((e) => next(e));
      }).catch((e) => next(e))
    }
  })
});

module.exports = router;