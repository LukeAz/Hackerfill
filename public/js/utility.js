'use strict'

function sendXhrForm(formId, alertId, action, redirect) {
  let form = document.getElementById(formId);
  let xhr = new XMLHttpRequest();
  xhr.open('POST', action);
  let data = JSON.stringify(Object.fromEntries(new FormData(form).entries()));
  let csrf = document.querySelector('meta[name="csrf-token"]');
  if(csrf != undefined)
    xhr.setRequestHeader('CSRF-Token', csrf.getAttribute('content'));
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send(data);
  
  xhr.onload = () => { 
    try {
      let response = JSON.parse(xhr.responseText);
      if(response.status == true)
        window.location.replace(redirect);
      else {
        let alert = document.getElementById(alertId);
        alert.innerHTML = response.message;
        alert.classList.remove('d-none');
      }
    } 
    catch(e) {
      let alert = document.getElementById(alertId);
      alert.innerHTML = "Error connecting with the server";
      alert.classList.remove('d-none');
    }
  }
}

function sendFiles(articleid) {
  let button = document.getElementById("filesUploadButton");
  let fileInput = document.getElementById("formFile");
  button.classList.add('disabled');

  let formData = new FormData();
  let sizeExceeded = 0;
  let maxSize = 50*1024*1024; //50MB
  
  for(let i=0; i < fileInput.files.length && sizeExceeded == 0; i++) {
    formData.append('upload', fileInput.files[i]);
    if(fileInput.files[i].size > maxSize) 
      sizeExceeded = 1;
  }

  if(fileInput.files.length != 0 && sizeExceeded == 0) {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/articles/upload/' + articleid);
    xhr.setRequestHeader('CSRF-Token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));
    xhr.send(formData);
    xhr.onload = () => {
      try {
        let response = JSON.parse(xhr.responseText);
        if(response.status == true)
          window.location.replace('/articles/' + articleid);
        else {
          let alert = document.getElementById('filesUploadFailed');
          alert.innerHTML = response.message;
          alert.classList.remove('d-none');
          button.classList.remove('disabled');
        }
      } 
      catch(e) {
        let alert = document.getElementById('filesUploadFailed');
        alert.innerHTML = "Error connecting with the server";
        alert.classList.remove('d-none');
      }
    }
  } else {
    let alert = document.getElementById('filesUploadFailed');
    alert.innerHTML = 'One of the uploaded files exceeds the maximum size (50MB) or empty input, upload cancelled.';
    alert.classList.remove('d-none');
    button.classList.remove('disabled');
  }
  
}

function disabledDeleteAccountToggle() {
  let deleteAccount = document.getElementById("checkDeleteAccount");
  let deleteArticles = document.getElementById("checkDeleteArticles");
  let deleteReviews = document.getElementById("checkDeleteReviews");
  let deleteButton = document.getElementById("deleteButton");

  if(deleteAccount.checked == true && deleteArticles.checked == true && deleteReviews.checked == true)
    deleteButton.classList.remove("disabled");
  else if(!deleteButton.classList.contains("disabled"))
    deleteButton.classList.add("disabled");
}