let username;
let conversation, data, datasend, users;

let artificialLatencyDelay=0;
let heartbeat = 10 ;
let socket;

// on load of page
window.onload = init;

function init() {
  username = prompt("Quel est votre nom?");

  // initialize socket.io client-side
  socket = io.connect();
  
  
  // get handles on various GUI components
  conversation = document.querySelector("#conversation");
  data = document.querySelector("#data");
  datasend = document.querySelector("#datasend");
  users = document.querySelector("#users");

  // Listener for send button
  datasend.onclick = (evt) => {
    sendMessage();
  };
  

  // detect if enter key pressed in the input field
  data.onkeypress = (evt) => {
    // if pressed ENTER, then send
    if (evt.keyCode == 13) {
      this.blur();
      sendMessage();
    }
  };

  // sends the chat message to the server
  function sendMessage() {
    let message = data.value;
    data.value = "";
    // tell server to execute 'sendchat' and send along one parameter
    socket.emit("sendchat", message);
  }

  socket.emit("getObstacle","");
  socket.emit("getCloudObstacle","");

  // on connection to server, ask for user's name with an anonymous callback
  socket.on("connect", () => {
    clientStartTimeAtConnection = Date.now();
    // call the server-side function 'adduser' and send one parameter (value of prompt)
    socket.emit("adduser", username);
  });

  // listener, whenever the server emits 'updatechat', this updates the chat body
  socket.on("updatechat", (username, data) => {
    let chatMessage = "<b>" + username + ":</b> " + data + "<br>";
    conversation.innerHTML += chatMessage;
  });

  // just one player moved
  socket.on("updatepos", (newPos) => {
    updatePlayerNewPos(newPos);
    //console.log(newPos);
  });

  socket.on("updatePoints", (newPoints) => {
    updatePlayerPoints(newPoints);
    //console.log(newPos);
  });


  // listener, whenever the server emits 'updateusers', this updates the username list
  socket.on("updateusers", (listOfUsers) => {
    users.innerHTML = "";
    for (let name in listOfUsers) {
      let userLineOfHTML = "<div>" + name + "</div>";
      users.innerHTML += userLineOfHTML;
    }
  });


  
  socket.on("gamestate", (gamestate) => {
    updatePlayers(gamestate.listOfplayers);
    updateObstacles(gamestate.listOfObstacles);
    updateCloudObstacles(gamestate.listOfCloudObstacles);
    updateLevelCounter(gamestate.level);
    for(player in gamestate.listOfplayers){
      updatePlayerNewPos({'username' : player,'x' : gamestate.listOfplayers[player].x, 'y' :gamestate.listOfplayers[player].y});
      updatePlayerPoints({'username' : player , 'points' : gamestate.listOfplayers[player].points});
    }    
  });

  socket.on('updateHeartbeat', (newHeartbeat) => {
    heartbeat = newHeartbeat;
  });

  // update the whole list of players, useful when a player
  // connects or disconnects, we must update the whole list
  socket.on("updatePlayers", (listOfplayers) => {
    updatePlayers(listOfplayers);
  });

  socket.on("updateObstacles", (listOfObstacles) => {
    updateObstacles(listOfObstacles);
  });

  socket.on("updateCloudObstacles", (listOfCloudObstacles) => {
    updateCloudObstacles(listOfCloudObstacles);
  });

  socket.on("updateLevelCounter", (newLevel) => {
    updateLevelCounter(newLevel);
  });

  // Latency, ping etc.
  socket.on("ping", () => {
    send("pongo");
  });

  socket.on("data", (timestamp, rtt, serverTime) => {
    //console.log("rtt time received from server " + rtt);

    let spanRtt = document.querySelector("#rtt");
    spanRtt.innerHTML = rtt;

    let spanPing = document.querySelector("#ping");
    spanPing.innerHTML = (rtt/2).toFixed(1);

    let spanServerTime = document.querySelector("#serverTime");
    spanServerTime.innerHTML = (serverTime/1000).toFixed(2);

    let clientTime = Date.now() - clientStartTimeAtConnection;

    let spanClientTime = document.querySelector("#clientTime");
    spanClientTime.innerHTML = (clientTime/1000).toFixed(2);
  
  });

  // we start the Game
  startGame();
}

// PERMET D'ENVOYER SUR WEBSOCKET en simulant une latence (donnée par la valeur de delay)
function send(typeOfMessage, data) {
  setTimeout(() => {
      socket.emit(typeOfMessage, data)
  }, artificialLatencyDelay);
}

function changeArtificialLatency(value) {
  artificialLatencyDelay = parseInt(value);

  let spanDelayValue = document.querySelector("#delay");
  spanDelayValue.innerHTML = artificialLatencyDelay;
}

function changeHeartbeat(value) {
  nbUpdate = parseInt(value);

  let spanHeartbeatValue = document.querySelector("#heartbeat");
  spanHeartbeatValue.innerHTML = nbUpdate;

  socket.emit('heartbeat',nbUpdate);
}
