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
      setCookie("player", player, 1);
    }
  }
  if (player != "" && player != null) {
    console.log(`Sending Username to server: ${player}`);
    chatSocket.send(JSON.stringify({
      'message': {'playerConnection': {'name': player}}
    }));
    return player;
  }
}, 500);

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

//pendingCards: [Is this needed? Just obscure
// tableData = dealerCards: [{'id': 1, 'Title': "", 'Description': ""}, {}, {},], playerCards: {}, roundCards: {}, winner}
//This is a whole package but the messages are handled separately

function setTable(cards) {
  if (tableData.state == "pick") {
    if (player == judge){
      loadCards('playerView', "red darken-2", false, false, tableData.pendingCards);
      loadCards('dealerView', "teal", true, judge, tableData.dealerCards);
      gameTimer(30)
    } else {
      loadCards('playerView', "red darken-2", false, false, tableData.playerCards);
      loadCards('dealerView', "teal", false, judge, tableData.pendingCards);
    }
  } else if (tableData.state == "play") {
      if (player == judge){
      loadCards('playerView', "red darken-2", false, false, tableData.pendingCards);
      loadCards('dealerView', "teal", false, judge, tableData.dealerCards);
    } else {
      loadCards('playerView', "red darken-2", true, false, tableData.playerCards);
      loadCards('dealerView', "teal", false, judge, tableData.dealerCards);
      gameTimer(30)
    }
  } else if (tableData.state == "judge") {
      if (player == judge){
      loadCards('playerView', "red darken-2", true, false, tableData.roundCards);
      loadCards('dealerView', "teal", false, judge, tableData.dealerCards);
      gameTimer(30)
    } else {
      loadCards('playerView', "red darken-2", false, false, tableData.roundCards);
      loadCards('dealerView', "teal", false, judge, tableData.dealerCards);
    }
  } else if (tableData.state == "final") {
    loadCards('playerView', "red darken-2", false, false, tableData.winner);
    loadCards('dealerView', "teal", false, judge, tableData.dealerCards);
    updateStatus("message", `<h4>Winner: ${tableData.winner[0].name}!</h4>`)
  }
  //updateStatus("dealerDeck", `Dealer Deck: ${dealerDeck}%`)
  //updateStatus("playerDeck", `Player Deck: ${playerDeck}%`)
}


const roomName = JSON.parse(document.getElementById('room-name').textContent);

const chatSocket = new WebSocket(
    'wss://devin.dice:1234@'
    + window.location.host
    + '/ws/status/'
    + roomName
    + '/'
);


function submit(playerCardsID, submitButton) {
  if (submitButton.value == true) {
    document.getElementById(submitButton.id).getElementById('cardsButton').innerHTML = "<a id='submit' class='btn waves-effect white grey-text darken-text-2'>button</a>";
  } else {
    document.getElementById(submitButton.id).getElementById('cardsButton').innerHTML = "";
  }
}

function loadCards(playerCardsID, data) {
  console.log("Processing Cards")
  let color = "teal";
  if (playerCardsID == 'playerView') {
    color = "red darken-2";
  }
  var cards = '<div id="cardsButton" class="carousel-fixed-item center">';
  cards += '</div>';
  data.forEach(function (item, index) {
    console.log(item.id)
    var card = `<div class="carousel-item ${color} white-text" href="#${index}!">`;
    card += `<h4 id="judge" class="rotate"></h4>`;
    card += `<h4>${item.cardTitle}</h4>`;
    card += `<h5 class="white-text">${item.cardDescription}</h5>`;
    card += '</div>';
    console.log(card);
    cards += card;
  })
  console.log('Done')
  $('#' + playerCardsID).html(cards);

  
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
    const data = JSON.parse(e.data);
    if (data.message.message) {
        console.log(`Message: ${data.message.message}`);
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
        console.log(`Cards`);
        console.log(`Cards: ${data.message.cards}`);
        let cards = JSON.parse(data.message.cards);
        //loadCards('playerView', cards)
        loadCards('playerView', cards)
        carouselRefresh()
    };
    if (data.message.submitButton) {
        let submitButton = JSON.parse(data.message.submitButton);
        //loadCards('playerView', cards)
        submit(submitButton)
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

