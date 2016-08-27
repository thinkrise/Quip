(function () {
  'use strict';

  var log = require('./log');

  var topic;
  var game;
  var question;
  var questionNo = 1;
  var correctAnswer;
  var points1 = document.getElementById("points1");
  var points2 = document.getElementById("points2");
  var left = 0;
  var right = 0;
  var maxQuestions = 0;

  loadView();
  loadTopic();
  loadGame();

  function loadView() {
    var answers = document.getElementById("answers");

    for (var index = 0; index < answers.childElementCount; index++) {
      answers.children[index].addEventListener('click', clickAnswer(index), false);
    }
  }

  function drawPoints() {
    points1.style.width = ((left / (maxQuestions * 2)) * 100)  + "%";
    points2.style.width = ((right / (maxQuestions * 2)) * 100) + "%";
  }

  function loadTopic() {
    log.info('Loading topic.');
    var xhr = new XMLHttpRequest();

    var gameId = document.getElementById('game-id').innerHTML;
    var questionText = document.getElementById('questionText');

    xhr.open("GET", "/api/game/" + gameId + '/' + questionNo, true, 'testadmin', 'password');
    xhr.setRequestHeader("Authorization", "Basic " + btoa('testadmin' + ":" + 'password'));
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        question = JSON.parse(xhr.responseText);
        log.info(JSON.stringify(game));
        questionText.innerHTML = question.text;
        drawPoints();
        prepareQuestion();
      }
    };
    xhr.send();
  }

  function loadGame() {
    log.info('Loading game.');
    var gameId = document.getElementById('game-id').innerHTML;

    var xhr = new XMLHttpRequest();

    xhr.open("GET", "/api/game/" + gameId, true, 'testadmin', 'password');
    xhr.setRequestHeader("Authorization", "Basic " + btoa('testadmin' + ":" + 'password'));
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        game = JSON.parse(xhr.responseText);
        maxQuestions = game.questions.length;
        document.getElementById("player1Avatar").src = game.players[0].avatar;
        document.getElementById("player2Avatar").src = game.players[1].avatar;
        document.getElementById("player1Score").src = game.players[0].score;
        document.getElementById("player2Score").src = game.players[1].score;
      }
    };
    xhr.send();
  }

  function prepareQuestion() {
    document.getElementById("questionText").textContent = question.text;
    // TODO: Add pictures. document.getElementById("questionPicture").src = question.picture;

    var answers = document.getElementById("answers");

    for (var index = 0; index < answers.childElementCount; index++) {
      answers.children[index].textContent = question.answers[index].text;

      /*if (topic.questions[questionNo].answers[i].correct === true) {
        correctAnswer = i;
      }*/
    }
  }

  function clickAnswer(index){
    return function () {
      checkAnswer(index);
    };
  }

  function checkAnswer(index) {
    if (question.answers[index].points > 0) {
      alert("Tada!");
      left++; //= (left + question.answers[index].points);
      drawPoints();

      questionNo++;
      prepareQuestion();
    } else {
      alert("Wrong Answer");
    }
  }
}
());
