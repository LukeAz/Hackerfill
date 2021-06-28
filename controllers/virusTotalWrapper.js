const FormData = require('form-data');
const axios = require('axios');

const computeAntiAbuseHeader = () => {
  let e = 1e10 * (1 + Math.random() % 5e4);
  return Buffer.from(`${(e<50) ? "-1" : e.toFixed(0)}-ZG9udCBiZSBldmls-${Date.now()/1e3}`).toString('base64');
};

const headers = {
  "accept": "application/json",
  "accept-encoding": "gzip, deflate, br",
  "accept-ianguage": "en-US,en;q=0.9,es;q=0.8",
  "accept-language": "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7",
  "Content-Type": "application/json",
  "dnt": 1,
  "Host": "www.virustotal.com",
  "origin": "https://www.virustotal.com",
  "referer": "https://www.virustotal.com/",
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  "sec-gpc": 1,
  "user-agent": "Mozilla/5.0",
  "x-app-version": "v1x25x2",
  "x-tool": "vt-ui-main"
};

/**
 * This part of the code contains a wrapper of the virus total api, 
 * the use of it in this school project is for illustration purposes 
 * and may stop working in the future.
 * Please do not submit any personal information; VirusTotal is not responsible for the contents of your submission.
 * All rights reserved to virustotal.
 * @param {string} filename name of the file to be checked
 * @param {*} buffer effective file
 * @param {*} sha256 hash of the file
 */

module.exports = async (filename, buffer, sha256) => {
  let finalUrl = `https://www.virustotal.com/gui/file/${sha256}/detection`;
  
  headers["x-vt-anti-abuse-header"] = computeAntiAbuseHeader();
  let res = await axios.get(`https://www.virustotal.com/ui/files/${sha256}`, {headers: headers}).catch(e => {return e.response.data});
  if(res.data === undefined && res.error.code == "NotFoundError") {
    headers["x-vt-anti-abuse-header"] = computeAntiAbuseHeader();
    res = await axios.get("https://www.virustotal.com/ui/files/upload_url", {headers: headers});
    let data = new FormData();
    data.append('file', buffer, {filename : filename});
    data.append('filename', filename);
    headers["x-vt-anti-abuse-header"] = computeAntiAbuseHeader();
    headers['Content-Type'] = `multipart/form-data; boundary=${data.getBoundary()}`;
    headers['accept'] = '*/*';
    res = await axios.post(res.data.data, data, {headers: headers});
    if(res.data.data.type == 'analysis') {
      headers["x-vt-anti-abuse-header"] = computeAntiAbuseHeader();
      headers['Content-Type'] = 'application/json';
      headers['accept'] = 'application/json';
      await axios.get(`https://www.virustotal.com/ui/analyses/${res.data.data.id}`, {headers: headers});
      return finalUrl;
    } else {
      throw new Error('failed');
    }
  } else {
    return finalUrl;
  }
}