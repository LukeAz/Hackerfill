'use strict'

var xhr = new XMLHttpRequest();
xhr.onload = () => {
  let response = JSON.parse(xhr.responseText);
  let myChart, delayed, labels = [], data = [];

  if(response.status == true) {
    let ul_leaderboard = document.getElementById('ul_leaderboard');
    for(let x of response.leaderboard) {
      let li = document.createElement('li');
      li.innerHTML = `
        <p class="colorgreen">Stars: ${x.stars}</p>
        <p class="me-4">Title: <i class="colorlight me-3">${x.title}</i> Writer: <i class="colorlight me-3">${x.advertiserid}</i></p>
        <a class="btn btn-outline-primary me-2 mb-2" href="/articles/${x.articlesid}" role="button">Article</a>
        <a class="btn btn-outline-primary me-2 mb-2" href="/public?unique=true&username=${x.advertiserid}" role="button">Profile</a>
      `;
      ul_leaderboard.appendChild(li);
      labels.push(x.title);
      data.push(x.stars);
    }
  }

  myChart = new Chart(document.getElementById('leaderboardCanvas'), {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Leaderboard',
          data: data,
          backgroundColor: 'rgb(159, 239, 0)',
          borderColor: 'rgb(255,255,255)',
        }
      ]
    },
    options: {
      legend: { display: false },
      responsive: true,
      plugins: {
        title: {
          color: '#a4b1cd',
          display: true,
          text: response.message
        }
      },
      animation: {
        onComplete: () => { delayed = true; },
        delay: (context) => {
          let delay = 0;
          if(context.type === 'data' && context.mode === 'default' && !delayed) 
            delay = context.dataIndex * 300 + context.datasetIndex * 100;
          return delay;
        },
      },
      scales: {
        x: { ticks: {color: '#a4b1cd'}},
        y: { ticks: {color: '#a4b1cd'}}
      }
    }
  });
};

xhr.open("POST", "/leaderboard", true);
xhr.send();