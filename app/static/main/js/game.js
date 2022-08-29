function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

let player;

setTimeout(function checkCookie() {
  let player = getCookie("player");
  if (player != "") {
   console.log("Welcome again " + player);
  } else {
    player = prompt("Please enter your name:", "");
    if (player != "" && player != null) {
      setCookie("player", player, 365);
    }
  }
  
  chatSocket.send(JSON.stringify({
    'message': {'player': {'name': player, 'cards':[]}}
  }));
  console.log(`Found Username: ${player}`);
  return player;
}, 500);

function loadTable(tableId, fields, data) {
  //$('#' + tableId).empty(); //not really necessary
  var rows = '';
  $.each(data, function(index, item) {
    var row = '<tr>';
    $.each(fields, function(index, field) {
        row += '<td>' + item[field+''] + '</td>';
    });
    rows += row + '</tr>';
  });
  $('#' + tableId + ' tbody').html(rows);
}






//if (player === undefined) {
//    console.log(`Main- No Username: ${player}`)
//        document.addEventListener('DOMContentLoaded', function() {
//          var elems = document.getElementById('login');
//          var instance = M.Modal.init(elems, {dismissible: false});
//              instance.open();
//        });
//} else {
//    console.log(`Main- Found Username: ${player}`)
//}


const roomName = JSON.parse(document.getElementById('room-name').textContent);

let update
//let update = {score: [
//  {name: 'Kyle', score: "1", status: "Pending"},
//  {name: 'Sandy', score: "0", status: "Pending"},
//  {name: 'Jamie', score: "1", status: "Submitted"},
//  {name: 'Alishia', score: "0", status: "Pending"},
//  {name: 'Devin', score: "0", status: "Pending"},
//  {name: 'April', score: "3", status: "Judge"},
//  {name: 'Lorie', score: "0", status: "Pending"},
//  {name: 'Jordan', score: "1", status: "Pending"},
//  {name: 'Ken', score: "0", status: "Offline"},
//  ],
//  playerCards: [
//  {id: '32', cardTitle: "BUG IN SALAD!", cardDescription: "What's worse:<br>Finding a bug<br>in your salad,<br>or finding half a bug<br>in your salad?"},
//  {id: '334', cardTitle: "PUBLIC SPEAKING", cardDescription: "\"...people's number one<br>fear is public speaking.<br>Number two is death...<br>to the average person,<br>your better off in the<br>casket than doing the<br>eulogy.\" -Jerry Seinfeld"},
//  {id: '234', cardTitle: "CALLING CUSTOMER SERVICE", cardDescription: "All of our representatives<br>are currently helping<br>other customers.<br>Your wait time<br>is aproximately<br>187 minutes.<br>Have a nice day"},
//  {id: '39', cardTitle: "BIG FOOT", cardDescription: "Legendary North<br>American monster,<br>aka, Sasquatch."},
//  {id: '754', cardTitle: "THE APOCALYPSE", cardDescription: "If the world ends and no<br>one is left to hear it...<br>does it matter?"},
//  ],
//  roundCards: [
//  {id: '32', cardTitle: "BUG IN SALAD!", cardDescription: "What's worse:<br>Finding a bug<br>in your salad,<br>or finding half a bug<br>in your salad?"},
//  {id: '334', cardTitle: "PUBLIC SPEAKING", cardDescription: "\"...people's number one<br>fear is public speaking.<br>Number two is death...<br>to the average person,<br>your better off in the<br>casket than doing the<br>eulogy.\" -Jerry Seinfeld"},
//  {id: '234', cardTitle: "CALLING CUSTOMER SERVICE", cardDescription: "All of our representatives<br>are currently helping<br>other customers.<br>Your wait time<br>is aproximately<br>187 minutes.<br>Have a nice day"},
//  {id: '39', cardTitle: "BIG FOOT", cardDescription: "Legendary North<br>American monster,<br>aka, Sasquatch."},
//  {id: '754', cardTitle: "THE APOCALYPSE", cardDescription: "If the world ends and no<br>one is left to hear it...<br>does it matter?"},
//  ],
//  winner: [
//  {name: 'Kyle', id: '32', cardTitle: "BUG IN SALAD!", cardDescription: "What's worse:<br>Finding a bug<br>in your salad,<br>or finding half a bug<br>in your salad?"},
//  ],
//  dealerCards: [
//  {id: '324', cardTitle: "Mysterious!", cardDescription: "secretive<br>puzzling<br>strange"},
//  ],
//  state: "play",
//  dealerDeck: 99,
//  playerDeck: 95
//};

//if (player === undefined) {
//    console.log(`Found Username: ${player}`)
//    var elems = document.getElementById('login')
//    var instance = M.Modal.init(elems, {dismissible: false});
//    instance.open();
//} else {
//    console.log(`Found Username: ${player}`)
//}

const chatSocket = new WebSocket(
    'wss://devin.dice:1234@'
    + window.location.host
    + '/ws/status/'
    + roomName
    + '/'
);

function loadCards(playerCardsID, color, submit, judge, data) {
  if (submit) {
    var cards = '<div class="carousel-fixed-item center">';
    cards += '<a id=submit class="btn waves-effect pulse white grey-text darken-text-2">Submit</a>';
    cards += '</div>';
  } else {
    var cards = ""
  }
  $.each(data, function(index, item) {
    console.log(`Processing ${index}: ${item.cardTitle}`)
    var card = `<div class="carousel-item ${color} darken-2 white-text" href="#${index}!">`;
    if (judge) {
      card += `<h4 class="rotate">${judge}</h4>`;
      card += `<h4>${item.cardTitle}</h4>`;
    } else {
      card += `<h4>${item.cardTitle}</h4>`;
    }
    card += `<h5 class="white-text">${item.cardDescription}</h5>`;
    card += '</div>';
    console.log(card)
    cards += card;
  });
  $('#' + playerCardsID).html(cards);
}


// Game timer
function gameTimer(seconds) {
  var timeleft = seconds;
  var downloadTimer = setInterval(function(){
    if(timeleft <= 0){
      clearInterval(downloadTimer);
    }
    console.log(timeleft);
    document.getElementById('submit').innerText = `Select (${timeleft})`;
    timeleft -= 1;
    console.log(player)
  }, 1000);
}


function updateCards(playerCards) {
  //playerCards = [
  //  {id: '2', cardTitle: "PUBLIC SPEAKING", cardDescription: "\"...people's number one<br>fear is public speaking.<br>Number two is death...<br>to the average person,<br>your better off in the<br>casket than doing the<br>eulogy.\" -Jerry Seinfeld"},
  //  {id: '3', cardTitle: "CALLING CUSTOMER SERVICE", cardDescription: "All of our representatives<br>are currently helping<br>other customers.<br>Your wait time<br>is aproximately<br>187 minutes.<br>Have a nice day"},
  //  {id: '4', cardTitle: "BIG FOOT", cardDescription: "Legendary North<br>American monster,<br>aka, Sasquatch."},
  //  {id: '5', cardTitle: "THE APOCALYPSE", cardDescription: "If the world ends and no<br>one is left to hear it...<br>does it matter?"},
  //  ];
  loadCards('playerView', 'red', false, false, playerCards);
  var instance = M.Carousel.init({
    fullWidth: true,
    indicators: true
  });
  // Or with jQuery
  $('.carousel.carousel-slider').carousel({
    fullWidth: true,
    indicators: true
  });
}

// Display number of active players
function playerCount(players) {
  count = 0
  let activePlayers = [];
  let playerTable = [];
  for (player in Object.keys(players)) {
    playerTable.push({ "name": Object.keys(players)[player], "score": Object.values(players)[player].score, "status":  Object.values(players)[player].status})
    if (Object.values(players)[player].status != "offline") {
      count++
      activePlayers.push(Object.keys(players)[player])
    }
  }
  console.log(`Players: ${activePlayers}`)
  console.log(JSON.stringify(playerTable))
  document.getElementById('gameStatsButton').innerText = `Players: ${ count }`;
  return playerTable;
}


// Modal
function scoreModal() {
  console.log("Loading table")
  loadTable('gameStats', ['name', 'score', 'status'], playerCount(players));
  document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.modal');
    var instances = M.Modal.init(elems, {});
  });
  // Or with jQuery
  $(document).ready(function(){
    $('.modal').modal();
  });
}


let players;
let judge;
chatSocket.onmessage = function(e) {
    console.log(e.data)
    const data = JSON.parse(e.data);
    if (data.message.message) {
        document.querySelector('#chat-log').value += (data.message.message + '\n');
    };
    if (data.message.mode) {
        console.log(`Mode: ${data.message.mode}`);
    };
    if (data.message.judgeCard) {
        console.log(`Judge Card: ${data.message.judgeCard}`);
    };
    if (data.message.timer) {
        console.log(`Timer: ${data.message.timer}`);
    };
    if (data.message.roundCards) {
        console.log(`Round Cards: ${data.message.roundCards}`);
    };
    if (data.message.winner) {
        console.log(`Winner: ${data.message.winner}`);
    };
    if (data.message.players) {
        players = data.message.players;
        //console.log(`Players: ${Object.keys(players)}`);
        playerCount(players);
        
        //loadTable('gameStats', ['name', 'score', 'status'], update.score);

    };
    if (data.message.judge) {
        console.log(`Judge: ${data.message.judge}`);
        judge = data.message.players
    };
    if (data.message.cards) {
        console.log(`Cards: ${data.message.cards}`);
        cards = data.message.cards
        updateCards(cards)
        carouselRefresh()
    };
};

chatSocket.onclose = function(e) {
    console.error('Chat socket closed unexpectedly');
    alert("You are disconnected")
};

document.querySelector('#chat-message-input').focus();
document.querySelector('#chat-message-input').onkeyup = function(e) {
    if (e.keyCode === 13) {  // enter, return
        document.querySelector('#chat-message-submit').click();
    }
};

document.querySelector('#username-input').focus();
document.querySelector('#username-input').onkeyup = function(e) {
    if (e.keyCode === 13) {  // enter, return
        document.querySelector('#chat-message-submit').click();
    }
};


document.querySelector('#chat-message-submit').onclick = function(e) {
    const messageInputDom = document.querySelector('#chat-message-input');
    const message = messageInputDom.value;
    chatSocket.send(JSON.stringify({
        'message': {'message': message}
    }));
    messageInputDom.value = '';
};

document.querySelector('#username-submit').onclick = function(e) {
    const messageInputDom = document.querySelector('#username-input');
    const username = messageInputDom.value;
    player = username;
    chatSocket.send(JSON.stringify({
        'message': {'player': {'name': username, 'cards':[]}}
    }));
    
    messageInputDom.value = '';
};


//let player = undefined;

//player = checkCookie();


//console.log(player)
//
//if (player === undefined) {
//    console.log(`Main- No Username: ${player}`)
//        document.addEventListener('DOMContentLoaded', function() {
//          var elems = document.getElementById('login');
//          var instance = M.Modal.init(elems, {dismissible: false});
//              instance.open();
//        });
//} else {
//    console.log(`Main- Found Username: ${player}`)
//}