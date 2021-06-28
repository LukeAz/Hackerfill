'use strict';
const fs = require('fs');
const dbms = require('./index');

module.exports = {
  getUserPassword: (username) => {
    return new Promise((resolve, reject) => {
      let db = dbms.getDbSession();
      db.get('SELECT username, password FROM users WHERE username = ?', username, (err, res) => {
        db.close();
        if(err || res === undefined)
          reject(err);
        else 
          resolve(res.password);
        });
    });
  },
  isAdvertiser: (username) => {
    return new Promise((resolve, reject) => {
      let db = dbms.getDbSession();
      db.get('SELECT advertiserid FROM advertiser WHERE advertiserid = ?', username, (err, user) => {
        db.close();
        if(err || user === undefined) 
          resolve(false);
        else 
          resolve(true);
      });
    });
  },
  getUserData: (username, role) => {
    return new Promise((resolve, reject) => {
      let db = dbms.getDbSession();
      if(role == "advertiser") {
        db.get('SELECT username, name, surname, email, imageprofile, biografy FROM users JOIN advertiser ON username = advertiserid WHERE username = ?', username, (err, user) => {
          db.close();
          if(err) 
            reject(err);
          else 
            resolve(user);
        });
      } else {
        db.get('SELECT username, name, surname, email, imageprofile, biografy FROM users JOIN reader ON username = readerid WHERE username = ?', username, (err, user) => {
          db.close();
          if(err) 
            reject(err);
          else 
            resolve(user);
        });
      }
    });
  },
  addAccount: (username, email, name, surname, password, role) => {
    return new Promise((resolve, reject) => {
      let db = dbms.getDbSession();
      db.run('INSERT INTO users (username, email, name, surname, biografy, imageprofile, password) VALUES (?, ?, ?, ?, NULL, NULL, ?)', [username, email, name, surname, password], (err) => {
        if(err) {
          db.close();
          reject(err);
        } else {
          if(role == 'advertiser') {
            db.run('INSERT INTO advertiser (advertiserid) VALUES (?)',[username], (err) => {
              if(err){
                db.run('DELETE FROM users WHERE username = ?', [username], () => db.close());
                reject(err);
              }
              else {
                db.close();
                resolve(); 
              }
            });
          }
          else {
            db.run('INSERT INTO reader (readerid) VALUES (?)',[username], (err) => {
              if(err){
                db.run('DELETE FROM users WHERE username = ?', [username], () => db.close());
                reject(err);
              }
              else {
                db.close();
                resolve(); 
              }
            });
          }
        }
      });
    });
  },
  updateAccount: (username, name, surname, email, biografy, imageprofile) => {
    return new Promise((resolve, reject) => {
      let db = dbms.getDbSession();
      db.run('UPDATE users SET name = ? , surname = ? , email = ?, biografy = ?, imageprofile = ? WHERE username = ?', name, surname, email, biografy, imageprofile, username, (err) => {
        db.close();
        if(err)
          reject(err);
        else
          resolve();
      });
    });
  },
  updatePassword: (username, password) => {
    return new Promise((resolve, reject) => {
      let db = dbms.getDbSession();
      db.run('UPDATE users SET password = ? WHERE username = ?', password, username, (err) => {
        db.close();
        if(err)
          reject(err);
        else
          resolve();
      });
    });
  },
  deleteAccount: (username, role) => {
    return new Promise((resolve, reject) => {
      let db = dbms.getDbSession();
      if(role == "advertiser") {
        module.exports.findAllArticles(username).then((articles) => {
          let remove = [];
          for(let x of articles) {
            remove.push(new Promise((resolve, reject) => {
              module.exports.deleteArticle(x.articlesid).then(() => {
                resolve();
              }).catch(e => reject(e));
            }));
          }
          Promise.all(remove).then(() => {
            db.run('DELETE FROM users WHERE username = ?', username, (err) => {
              if(err)
                reject(err);
              else
                resolve();
            });
          }).catch(e => reject(e));
        }).catch(e => reject(e));
      } else {
        db.run('DELETE FROM users WHERE username = ?', username, (err) => {
          if(err)
            reject(err);
          else
            resolve();
        });
      }
      
    });
  },
  getCategory: () => {
    return new Promise((resolve, reject) => {
      let db = dbms.getDbSession();
      db.all('SELECT * FROM category', (err, category) => {
        db.close();
        if(err)
          reject(err);
        else
          resolve(category);
      });
    });
  },
  addArticle: (username, category, title, description, markdown, imagearticle) => {
    return new Promise((resolve, reject) => {
      let db = dbms.getDbSession();
      db.run('INSERT INTO articles (advertiserid, categoryid, title, description, markdown, imagearticle) VALUES (?, ?, ?, ?, ?, ?)', [username, category, title, description, markdown, imagearticle], (err) => {
        if(err) {
          db.close();
          reject(err);
        }
        else {
          db.get('SELECT articlesid FROM articles WHERE advertiserid = ? AND title = ?', username, title, (err, res) => {
            db.close();
            if(err)
              reject(err);
            else {
              fs.mkdir(`./articles/${res.articlesid}`, (err) => {
                if(err)
                  reject(err);
                else
                  resolve();
              });
            }
          }); 
        }
      })
    });
  },
  findArticles: (advertiserid = '%', categoryid = '%', title = '%', description = '%', text = '%', page = 1) => {
    return new Promise((resolve, reject) => {
      let db = dbms.getDbSession();
      let offset = (page-1)*4;

      db.all('SELECT * FROM articles WHERE categoryid LIKE ? AND advertiserid LIKE ? AND title LIKE ? AND description LIKE ? AND markdown LIKE ? LIMIT 4 OFFSET ?', categoryid, advertiserid, title, description, text, offset, (err, articles) => {
          if(err)
            reject(err);
          else {
            db.get('SELECT COUNT(articlesid) as count FROM articles WHERE categoryid LIKE ? AND advertiserid LIKE ? AND title LIKE ? AND description LIKE ? AND markdown LIKE ?', categoryid, advertiserid, title, description, text, (err, count) => {
              db.close();
              if(err)
                reject(err);
              else 
                resolve({list: articles, ntot: count.count});
            });
          }
      });
    });
  },
  findAllArticles: (advertiserid) => {
    return new Promise((resolve, reject) => {
      let db = dbms.getDbSession();

      db.all('SELECT * FROM articles WHERE advertiserid = ?', advertiserid, (err, articles) => {
        db.close();
        if(err)
          reject(err);
        else 
          resolve(articles);
      });
    });
  },
  findArticle: (articlesid) => {
    return new Promise((resolve, reject) => {
      let db = dbms.getDbSession();
      db.get('SELECT * FROM articles WHERE articlesid = ?', articlesid, (err, article) => {
        db.close();
        if(err)
          resolve(false);
        else
          resolve(article);
      });
    });
  },
  updateArticle: (articlesid, title, description, markdown, imagearticle) => {
    return new Promise((resolve, reject) => {
      let db = dbms.getDbSession();
      db.run('UPDATE articles SET title = ? , description = ? , markdown = ?, imagearticle = ? WHERE articlesid = ?', title, description, markdown, imagearticle, articlesid , (err) => {
        db.close();
        if(err)
          reject(err);
        else
          resolve();
      });
    });
  },
  deleteArticle: (articlesid) => {
    return new Promise((resolve, reject) => {
      let db = dbms.getDbSession();
      db.run('DELETE FROM articles WHERE articlesid = ?', [articlesid], (err) => {
        db.close();
        if(err)
          reject(err);
        else {
          if(process.versions.node.split('.')[0] < 16)
            fs.rmdir(`./articles/${articlesid}`, {recursive: true}, (err) => {
              if(err)
                reject(err);
              else
                resolve();
            });
          else
            fs.rm(`./articles/${articlesid}`, {recursive: true}, (err) => {
              if(err)
                reject(err);
              else
                resolve();
            });
        }
      });
    })
  },
  addMaterial: (articlesid, filepath) => {
    return new Promise((resolve, reject) => {
      let db = dbms.getDbSession();
      db.run('INSERT INTO material (articlesid, filepath, virustotalurl) VALUES (?, ?, NULL)', [articlesid, filepath], (err) => {
        db.close();
        if(err)
          reject(err);
        else
          resolve();
      });
    })
  },
  uploadVirusTotalLink: (articlesid, filepath, virustotalurl) => {
    return new Promise((resolve, reject) => {
      let db = dbms.getDbSession();
      db.run('UPDATE material SET virustotalurl = ? WHERE articlesid = ? AND filepath = ?', virustotalurl, articlesid, filepath, (err) => {
        db.close();
        if(err)
          reject(err);
        else
          resolve();
      });
    });
  },
  findMaterials: (articlesid) => {
    return new Promise((resolve, reject) => {
      let db = dbms.getDbSession();
      db.all('SELECT * FROM material WHERE articlesid = ?', articlesid, (err, materials) => {
        db.close();
        if(err)
          reject(err);
        else
          resolve(materials);
      });
    });
  },
  findMaterial: (materialid) => {
    return new Promise((resolve, reject) => {
      let db = dbms.getDbSession();
      db.get('SELECT * FROM material WHERE materialid = ?', materialid, (err, material) => {
        db.close();
        if(err)
          reject(err);
        else
          resolve(material);
      });
    });
  },
  deleteMaterial: (articlesid, materialid, filepath) => {
    return new Promise((resolve, reject) => {
      let db = dbms.getDbSession();
      db.run('DELETE FROM material WHERE materialid = ?', [materialid], (err) => {
        db.close();
        if(err)
          reject(err);
        else {
          if(process.versions.node.split('.')[0] < 16)
            fs.unlink(`./articles/${articlesid}/${filepath}`, (err) => {
              if(err)
                reject(err);
              else
                resolve();
            });
          else
            fs.rm(`./articles/${articlesid}/${filepath}`, (err) => {
              if(err)
                reject(err);
              else
                resolve();
            });
        }
      });
    });
  },
  deleteMaterialError: (articlesid, filepath) => {
    return new Promise((resolve, reject) => {
      let db = dbms.getDbSession();
      db.run('DELETE FROM material WHERE articlesid = ? AND filepath = ?', articlesid, filepath, (err) => {
        db.close();
        if(err)
          reject(err);
        else {
          resolve();
        }
      });
    });
  },
  addReview: (username, articlesid, title, text, stars) => {
    return new Promise((resolve, reject) => {
      let db = dbms.getDbSession();
      db.run('INSERT INTO reviews (username, articlesid, title, text, stars) VALUES (?, ?, ?, ?, ?)', username, articlesid, title, text, stars, (err) => {
        db.close();
        if(err)
          reject(err);
        else
          resolve();
      });
    })
  },
  findReviews: (articlesid, username) => {
    return new Promise((resolve, reject) => {
      let db = dbms.getDbSession();
      if(username === undefined)
        username = '%';

      db.all('SELECT * FROM reviews WHERE articlesid = ? AND username LIKE ?', articlesid, username, (err, reviews) => {
        db.close();
        if(err)
          reject(err);
        else
          resolve(reviews);
      });
    });
  },
  findReview: (username, articlesid) => {
    return new Promise((resolve, reject) => {
      let db = dbms.getDbSession();
      db.get('SELECT * FROM reviews WHERE username = ? AND articlesid = ?', username, articlesid, (err, review) => {
        db.close();
        if(err)
          reject(err);
        else
          resolve(review);
      });
    });
  },
  updateReview: (username, articlesid, title, text, stars) => {
    return new Promise((resolve, reject) => {
      let db = dbms.getDbSession();
      db.run('UPDATE reviews SET title = ? , text = ? , stars = ? WHERE username = ? AND articlesid = ?', title, text, stars, username, articlesid, (err) => {
        db.close();
        if(err)
          reject(err);
        else
          resolve();
      });
    });
  },
  deleteReview: (username, articlesid) => {
    return new Promise((resolve, reject) => {
      let db = dbms.getDbSession();
      db.run('DELETE from reviews WHERE username = ? AND articlesid = ?', username, articlesid, (err) => {
        db.close();
        if(err)
          reject(err);
        else
          resolve();
      })
    });
  },
  leaderboard: () => {
    return new Promise((resolve, reject) => {
      let db = dbms.getDbSession();
      db.all('SELECT articlesid, articles.title, articles.advertiserid, SUM(stars) AS stars FROM reviews JOIN articles USING(articlesid) GROUP BY articlesid ORDER BY stars DESC LIMIT 6', (err, leaderboard) => {
        db.close();
        if(err)
          reject(err);
        else
          resolve(leaderboard);
      })
    });
  },
  findAdvertiserProfiles: (username = '%', page = 1) => {
    return new Promise((resolve, reject) => {
      let db = dbms.getDbSession();
      let offset = (page-1)*4;

      db.all('SELECT username, biografy, imageprofile FROM users JOIN advertiser ON username = advertiserid WHERE username LIKE ? LIMIT 4 OFFSET ?', username, offset,  (err, users) => {
        if(err)
          reject(err);
        else {
          db.get('SELECT COUNT(username) as count FROM users JOIN advertiser ON username = advertiserid WHERE username LIKE ?', username, (err, count) => {
            db.close();
            if(err)
              reject(err);
            else 
              resolve({list: users, ntot: count.count});
          });
        }
      });
    }); 
  }
}
