let pendingCards = [{id: '32', cardTitle: "No Card(s)", cardDescription: "Waiting for other players."}];

function updateStatus(id, value) {
  document.getElementById(id).innerHTML = value;
}


// Modal
function scoreModel() {
  document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.modal');
    var instances = M.Modal.init(elems, {});
  });
  // Or with jQuery
  $(document).ready(function(){
    $('.modal').modal();
  });
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


// Display number of active players
function playerCount(score) {
  playerCount = 0
  score.forEach((x, i) => { 
    if (x.status != "Offline"){
      playerCount++
    }
  });
  console.log(`Players: ${playerCount}`);
  document.getElementById('gameStatsButton').innerText = `Players: ${ playerCount }`;
}


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


function updateCards() {
  playerCards = [
    {id: '2', cardTitle: "PUBLIC SPEAKING", cardDescription: "\"...people's number one<br>fear is public speaking.<br>Number two is death...<br>to the average person,<br>your better off in the<br>casket than doing the<br>eulogy.\" -Jerry Seinfeld"},
    {id: '3', cardTitle: "CALLING CUSTOMER SERVICE", cardDescription: "All of our representatives<br>are currently helping<br>other customers.<br>Your wait time<br>is aproximately<br>187 minutes.<br>Have a nice day"},
    {id: '4', cardTitle: "BIG FOOT", cardDescription: "Legendary North<br>American monster,<br>aka, Sasquatch."},
    {id: '5', cardTitle: "THE APOCALYPSE", cardDescription: "If the world ends and no<br>one is left to hear it...<br>does it matter?"},
    ];
  loadCards('playerView', playerCards);
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


// Carousel  
function carouselRefresh() {
  var instance = M.Carousel.init({
    fullWidth: true,
    indicators: true
    // Display active card to group
    //onCycleTo: function (ele) {
    //  console.log(playerCards[$(ele).index()-1].id); // the slide's index
    //}
  });
  // Or with jQuery
  $('.carousel.carousel-slider').carousel({
    fullWidth: true,
    indicators: true
    // Display active card to group
    //onCycleTo: function (ele) {
    //  console.log(playerCards[$(ele).index()-1].id); // the slide's index
    //}
  });
}


let judge = update.score.find(x => x.status === 'Judge').name
let player = undefined;

playerCount(update.score);
scoreModel()
loadTable('gameStats', ['name', 'score', 'status'], update.score);
if (update.state == "pick") {
  if (player == judge){
    loadCards('playerView', "red darken-2", false, false, pendingCards);
    loadCards('dealerView', "teal", true, judge, update.dealerCards);
    gameTimer(30)
  } else {
    loadCards('playerView', "red darken-2", false, false, update.playerCards);
    loadCards('dealerView', "teal", false, judge, pendingCards);
  }
} else if (update.state == "play") {
    if (player == judge){
    loadCards('playerView', "red darken-2", false, false, pendingCards);
    loadCards('dealerView', "teal", false, judge, update.dealerCards);
  } else {
    loadCards('playerView', "red darken-2", true, false, update.playerCards);
    loadCards('dealerView', "teal", false, judge, update.dealerCards);
    gameTimer(30)
  }
} else if (update.state == "judge") {
    if (player == judge){
    loadCards('playerView', "red darken-2", true, false, update.roundCards);
    loadCards('dealerView', "teal", false, judge, update.dealerCards);
    gameTimer(30)
  } else {
    loadCards('playerView', "red darken-2", false, false, update.roundCards);
    loadCards('dealerView', "teal", false, judge, update.dealerCards);
  }
} else if (update.state == "final") {
  loadCards('playerView', "red darken-2", false, false, update.winner);
  loadCards('dealerView', "teal", false, judge, update.dealerCards);
  updateStatus("message", `<h4>Winner: ${update.winner[0].name}!</h4>`)
}
//updateStatus("dealerDeck", `Dealer Deck: ${update.dealerDeck}%`)
//updateStatus("playerDeck", `Player Deck: ${update.playerDeck}%`)
carouselRefresh()


console.log(player)

if (player === undefined) {
    console.log(`Main- No Username: ${player}`)
        document.addEventListener('DOMContentLoaded', function() {
          var elems = document.getElementById('login');
          var instance = M.Modal.init(elems, {dismissible: false});
              instance.open();
        });
} else {
    console.log(`Main- Found Username: ${player}`)
}


