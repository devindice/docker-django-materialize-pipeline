let pendingCards = [{id: '32', cardTitle: "No Card(s)", cardDescription: "Waiting for other players."}];

function updateStatus(id, value) {
  document.getElementById(id).innerHTML = value;
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










//if (update.state == "pick") {
//  if (player == judge){
//    loadCards('playerView', "red darken-2", false, false, pendingCards);
//    loadCards('dealerView', "teal", true, judge, update.dealerCards);
//    gameTimer(30)
//  } else {
//    loadCards('playerView', "red darken-2", false, false, update.playerCards);
//    loadCards('dealerView', "teal", false, judge, pendingCards);
//  }
//} else if (update.state == "play") {
//    if (player == judge){
//    loadCards('playerView', "red darken-2", false, false, pendingCards);
//    loadCards('dealerView', "teal", false, judge, update.dealerCards);
//  } else {
//    loadCards('playerView', "red darken-2", true, false, update.playerCards);
//    loadCards('dealerView', "teal", false, judge, update.dealerCards);
//    gameTimer(30)
//  }
//} else if (update.state == "judge") {
//    if (player == judge){
//    loadCards('playerView', "red darken-2", true, false, update.roundCards);
//    loadCards('dealerView', "teal", false, judge, update.dealerCards);
//    gameTimer(30)
//  } else {
//    loadCards('playerView', "red darken-2", false, false, update.roundCards);
//    loadCards('dealerView', "teal", false, judge, update.dealerCards);
//  }
//} else if (update.state == "final") {
//  loadCards('playerView', "red darken-2", false, false, update.winner);
//  loadCards('dealerView', "teal", false, judge, update.dealerCards);
//  updateStatus("message", `<h4>Winner: ${update.winner[0].name}!</h4>`)
//}
//updateStatus("dealerDeck", `Dealer Deck: ${update.dealerDeck}%`)
//updateStatus("playerDeck", `Player Deck: ${update.playerDeck}%`)
