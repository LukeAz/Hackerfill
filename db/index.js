'use strict';
const sqlite3 = require('sqlite3');
const fs = require('fs');

module.exports = {
  initialize: () => {
    if(!fs.existsSync('./db/hackerfill.db')) {
      let db = module.exports.getDbSession();
      db.serialize(() => {
        db.exec(fs.readFileSync('./db/install/schema.sql', 'utf-8'));
        db.exec(fs.readFileSync('./db/install/input.sql', 'utf-8'));
        db.run(`INSERT INTO articles (advertiserid, categoryid, title, description, markdown, imagearticle) VALUES ('lukeaz', 'Web', 'Hackerfill', 'Project presentation', ?, 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%3Fid%3DOIP.3FAisqhhGyU1mxs1fUGVAwHaEK%26pid%3DApi&f=1')` , fs.readFileSync('./db/install/markdown/hackerfill.md'));
        db.run(`INSERT INTO articles (advertiserid, categoryid, title, description, markdown, imagearticle) VALUES ('lukeaz', 'Web', 'Editor.md', "This article is an example, it talks about the editor used in this project. To make the platform more secure, scripts and various HTML tags were disabled. I modified the source code by adding DOM purify to clean up the HTML generated by the editor and avoid XSS, since there were issues regarding it in the project's github. With this modification there should be no XSS issues.", ?, 'https://pandao.github.io/editor.md/images/logos/editormd-logo-180x180.png')`, fs.readFileSync('./db/install/markdown/editor.md'));
        db.run(`INSERT INTO articles (advertiserid, categoryid, title, description, markdown, imagearticle) VALUES ('lukeaz', 'Web', 'DOMPurify', 'DOMPurify is a DOM-only, super-fast, uber-tolerant XSS sanitizer for HTML, MathML and SVG.', ?, 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.4UTm4IP4WB-j9m7P1tv6xgAAAA%26pid%3DApi&f=1')`, fs.readFileSync('./db/install/markdown/dompurify.md'));
        db.run(`INSERT INTO articles (advertiserid, categoryid, title, description, markdown, imagearticle) VALUES ('lukeaz', 'Web', 'XSS TEST', 'Testing xss on this editor', ?, 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.V_J8Kf9-FO9wMpzuLssaygHaD5%26pid%3DApi&f=1')`, fs.readFileSync('./db/install/markdown/xss.md'));
        db.run(`INSERT INTO articles (advertiserid, categoryid, title, description, markdown, imagearticle) VALUES ('marcello', 'Web', 'SqlMap', 'Sqlmap is an open source penetration testing tool that automates the process of detecting and exploiting SQL injection', ?, 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%3Fid%3DOIP.WljqtpNteg1b0dKZwL688QHaD0%26pid%3DApi&f=1')`, fs.readFileSync('./db/install/markdown/sqlmap.md'));
        db.run(`INSERT INTO articles (advertiserid, categoryid, title, description, markdown, imagearticle) VALUES ('radolfo', 'Web', 'Empty page', '-', ?, 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.ytimg.com%2Fvi%2FtPIag8HDLIU%2Fmaxresdefault.jpg&f=1&nofb=1')`, fs.readFileSync('./db/install/markdown/empty.md'));
        db.exec(fs.readFileSync('./db/install/input2.sql', 'utf-8'), () => db.close());
      });
    }
  },
  getDbSession: () => {
    let db = new sqlite3.Database('./db/hackerfill.db');
    db.run("PRAGMA foreign_keys = ON");
    return db; 
  }
}
    