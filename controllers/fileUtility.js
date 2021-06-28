'use strict';
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const query = require('../db/query');
const virustotal = require('./virusTotalWrapper');

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, `articles/${req.params.articlesid}/`);
    },
    filename: (req, file, cb) => { 
      cb(null, file.originalname);
    }
  }),
  limits: { fileSize: 50 * 1024 * 1024 }, //50MB
  fileFilter: (req, file, cb) => {
    if(req.user === undefined || req.params.articlesid == undefined || req.user.role != "advertiser")
      cb(null, false);
    else {
      query.findArticle(req.params.articlesid).then((article) => {
        req.article = article;
        let antiAbuseFileName = /[`\[\]\\\/~]/;
        if(article.advertiserid == req.user.username && antiAbuseFileName.test(file.originalname) == false)
          query.addMaterial(req.params.articlesid, file.originalname).then(() => {
            req.materialFileName = file.originalname;
            cb(null, true);
          }).catch(() => cb(null, false));
        else 
          cb(null, false);
      }).catch(() => cb(null, false));
    }
  }
}).array('upload');

const checksumFile = (files, articlesid) => {
  return new Promise((resolve, reject) => {
    let promises = [];
    for(let x of files) {
      promises.push(new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(x.path);
        const buffers = [];
        stream.on('error', err => reject(err));
        stream.on('data', chunk => {
          hash.update(chunk);
          buffers.push(Buffer.from(chunk));
        });
        stream.on('end', () => {
          virustotal(x.filename, Buffer.concat(buffers), hash.digest('hex')).then((url) => {
            query.uploadVirusTotalLink(articlesid, x.filename, url).then(() => {
              resolve();
            }).catch((e) => reject(e));
          }).catch((e) => reject(e));
        });
      }));
    }
    Promise.all(promises).then(() => {
      resolve();
    }).catch((e) => reject(e));
  });
}

module.exports = {
  fileUpload: upload,
  checksumFile: checksumFile
}