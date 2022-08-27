const roomName = JSON.parse(document.getElementById('room-name').textContent);

let update = {score: [
  {name: 'Kyle', score: "1", status: "Pending"},
  {name: 'Sandy', score: "0", status: "Pending"},
  {name: 'Jamie', score: "1", status: "Submitted"},
  {name: 'Alishia', score: "0", status: "Pending"},
  {name: 'Devin', score: "0", status: "Pending"},
  {name: 'April', score: "3", status: "Judge"},
  {name: 'Lorie', score: "0", status: "Pending"},
  {name: 'Jordan', score: "1", status: "Pending"},
  {name: 'Ken', score: "0", status: "Offline"},
  ],
  playerCards: [
  {id: '32', cardTitle: "BUG IN SALAD!", cardDescription: "What's worse:<br>Finding a bug<br>in your salad,<br>or finding half a bug<br>in your salad?"},
  {id: '334', cardTitle: "PUBLIC SPEAKING", cardDescription: "\"...people's number one<br>fear is public speaking.<br>Number two is death...<br>to the average person,<br>your better off in the<br>casket than doing the<br>eulogy.\" -Jerry Seinfeld"},
  {id: '234', cardTitle: "CALLING CUSTOMER SERVICE", cardDescription: "All of our representatives<br>are currently helping<br>other customers.<br>Your wait time<br>is aproximately<br>187 minutes.<br>Have a nice day"},
  {id: '39', cardTitle: "BIG FOOT", cardDescription: "Legendary North<br>American monster,<br>aka, Sasquatch."},
  {id: '754', cardTitle: "THE APOCALYPSE", cardDescription: "If the world ends and no<br>one is left to hear it...<br>does it matter?"},
  ],
  roundCards: [
  {id: '32', cardTitle: "BUG IN SALAD!", cardDescription: "What's worse:<br>Finding a bug<br>in your salad,<br>or finding half a bug<br>in your salad?"},
  {id: '334', cardTitle: "PUBLIC SPEAKING", cardDescription: "\"...people's number one<br>fear is public speaking.<br>Number two is death...<br>to the average person,<br>your better off in the<br>casket than doing the<br>eulogy.\" -Jerry Seinfeld"},
  {id: '234', cardTitle: "CALLING CUSTOMER SERVICE", cardDescription: "All of our representatives<br>are currently helping<br>other customers.<br>Your wait time<br>is aproximately<br>187 minutes.<br>Have a nice day"},
  {id: '39', cardTitle: "BIG FOOT", cardDescription: "Legendary North<br>American monster,<br>aka, Sasquatch."},
  {id: '754', cardTitle: "THE APOCALYPSE", cardDescription: "If the world ends and no<br>one is left to hear it...<br>does it matter?"},
  ],
  winner: [
  {name: 'Kyle', id: '32', cardTitle: "BUG IN SALAD!", cardDescription: "What's worse:<br>Finding a bug<br>in your salad,<br>or finding half a bug<br>in your salad?"},
  ],
  dealerCards: [
  {id: '324', cardTitle: "Mysterious!", cardDescription: "secretive<br>puzzling<br>strange"},
  ],
  state: "play",
  dealerDeck: 99,
  playerDeck: 95
};

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

chatSocket.onmessage = function(e) {
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
        console.log(`Players: ${data.message.players}`);
    };
    if (data.message.judge) {
        console.log(`Judge: ${data.message.judge}`);
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
        'message': {'player': {'name': username, 'cards':[], 'state': 'active'}}
    }));
    
    messageInputDom.value = '';
};
