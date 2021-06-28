'use strict';
const fs = require('fs');
const jwt = require('jsonwebtoken');

const privateKey = fs.readFileSync('./config/jwtRS256.key', 'utf8');
const publicKey = fs.readFileSync('./config/jwtRS256.key.pub', 'utf8');  
const jwtOption = {
  algorithm: 'RS256',
  expiresIn: '2h'
}

module.exports = {
  sign: (payload) => {
    return new Promise((resolve, reject) => {
      jwt.sign(payload, privateKey, jwtOption, (err, token) => {
        if(err)
          reject(err);
        else
          resolve(token);
      });
    });
  },
  verify: (token) => {
    return new Promise((resolve, reject) => {
      jwt.verify(token, publicKey, jwtOption, (err, decoded) => {
        if(err)
          reject(err);
        else
          resolve(decoded);
      });
    });
  }
}
