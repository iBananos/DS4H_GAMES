

class Obstacle {
    constructor(Xi, Yi, Xtaille, Ytaille, vitesseX, vitesseY,color,id) {
        this.x = Xi;
        this.y = Yi;
        this.Xtaille = Xtaille;
        this.Ytaille = Ytaille;
        this.vitesseX = vitesseX;
        this.vitesseY = vitesseY;
        this.color = color;
		this.id = id;
    }

	//mouvement d'un nuage
	movingCloudObstacles(delta,speed){
		if(this.x+this.Xtaille < 0){
			this.x = 1000 + this.id*200; 
			this.y = (this.y+300)%500;
		}else{
		this.x += calcDistanceToMove(delta, this.vitesseX*speed); ;
		}
  	}
  
  	//mouvement d'un avion
  	movingObstacles(delta,speed){
	  if((this.y+this.vitesseY*speed*delta+this.Ytaille<500) && (this.y+this.vitesseY*speed*delta>0)){

		this.y += calcDistanceToMove(delta, this.vitesseY*speed);
	  }else{
		this.vitesseY = -this.vitesseY;
	  }
	  if((this.x + this.vitesseX*speed*delta + this.Xtaille < 1000) && (this.x+this.vitesseX*speed*delta>100)){
		this.x += calcDistanceToMove(delta, this.vitesseX*speed);
	  }else{
		this.vitesseX = -this.vitesseX;
	  }
  	}
}

class Player {
    constructor(id, name) {
		this.width = 75;
		this.height = 75*0.75;
        this.x = 10;
        this.y = ((75*0.75*1.2)*id)%500;
		this.v = 1;
        this.vitesseX = 0;
        this.vitesseY = 0;
		this.id = id;
        this.name = name;
		this.points = 0
    }

	//fait bouger un jouer d'un "cran" en fonction de sa vitesse
	move(delta,speed,x,y){
		var distX = calcDistanceToMove(delta, this.vitesseX*speed);
		var distY = calcDistanceToMove(delta, this.vitesseY*speed);
		if((this.x + delta, this.vitesseX*speed*delta+this.width<canvasWidth) && (this.x+this.vitesseX*speed*delta>0)){
			if(/*x-this.x > 30 || */x-this.x < distX){
				this.x = x ;
			}else{
				this.x += distX;
			}
		  }else{
			this.vitesseX = 0;
		  }
		  if((this.y+this.vitesseY*speed*delta+this.height<canvasHeight) && (this.y+this.vitesseY*speed*delta>0)){
			  if(/*y-this.y >30 ||*/ y-this.y < distY){
				  this.y = y;
			  }else{
				this.y += distY;
			  }
		  }else{
			this.vitesseY = 0;
		  }
	}

}

const express = require('express')
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

http.listen(8082, () => {
	console.log("Web server écoute sur http://localhost:8082");
})

// Indicate where static files are located. Without this, no external js file, no css...  
app.use(express.static(__dirname + '/public'));    


// routing
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// nom des joueurs connectés sur le chat
var playerNames = {};
var canvasHeight = 500;
var speedObstacle = [	{'vx' :-1,'vy' : -1},
						{'vx' :-1,'vy' : 0},
						{'vx' :-1,'vy' : 1},
						{'vx' :0,'vy' : 1},
						{'vx' :1,'vy' : 1},
						{'vx' :1,'vy' : 0},
						{'vx' :1,'vy' : -1},
						{'vx' :0,'vy' : -1} ];
var speed = 100 ;
var level = 1;
var numbPlayer = 0;
var canvasWidth = 1000;
var listOfPlayers = {};
var listOfObstacles = {};
var listOfCloudObstacles = {}
var listOfPositions= {}
var gamestate = {}; 
// pour le calcul du temps
var delta= 0;

var time =Date.now();
var oldTime = time;
var nbUpdatesPerSeconds = 100;
var calculHeartbeat = 10;


//instancie les obstacles avions
function createObstacle(){
	var list = {};
	for(let i=0; i < 8 ; i++){
	  list[i] = setObstacle();
	}
	listOfObstacles =  list;
}

//creer un obstacle avion
function setObstacle(){
	let Xi = Math.floor(Math.random() * Math.floor(800)) + 100 ;
	let Yi = Math.floor(Math.random() * Math.floor(400)); 
	let Xtaille = 75; 
	let Ytaille = Xtaille*0.75;
	let id = (Math.floor(Math.random() * Math.floor(8))) ;
  	let vitesseX= speedObstacle[id].vx;
	let vitesseY = speedObstacle[id].vy; 
	//let newObstacle = {'x':Xi, 'y':Yi, 'Xtaille':Xtaille, 'Ytaille':Ytaille, 'vitesseX':vitesseX, 'vitesseY': vitesseY, 'color':'red'};
	let newObstacle = new Obstacle(Xi, Yi,Xtaille,Ytaille, vitesseX, vitesseY,'red',id);
	return newObstacle;
}

//instancie les obstacles nuages
function createCloudObstacle(){
	var list = {};
	for(let i=0; i < 5 ; i++){
		list[i] = setCloudObstacle(i);
	}
	listOfCloudObstacles =  list;
}

//creer un obstacle nuage
function setCloudObstacle(i){
	let Xi = canvasWidth + Math.floor(Math.random() * Math.floor(1000));
	let Xtaille = Math.floor(Math.random() * Math.floor(400))+100;
	let Yi = Math.floor(Math.random() * Math.floor(canvasHeight-Xtaille));  
	let id = i ;
	let Ytaille = Xtaille*0.75;
	let vitesseX = -Math.floor(Math.random() * Math.floor(5));
	let vitesseY = 0 ;
	//let CloudObstacle = {'x':Xi, 'y':Yi, 'Xtaille':Xtaille, 'Ytaille':Ytaille, 'vitesseX':vitesseX, 'vitesseY': vitesseY, 'id':id};
	let CloudObstacle = new Obstacle(Xi, Yi, Xtaille, Ytaille, vitesseX, vitesseY, 'white', id);

	return CloudObstacle;
}

//mouvement des obstacles
function movingAllObstacles(){
	for(let obstacle in listOfObstacles)  {
	    listOfObstacles[obstacle].movingObstacles(delta,speed);
	}
	for(let obstacle in listOfCloudObstacles)  {
		listOfCloudObstacles[obstacle].movingCloudObstacles(delta,speed);
	}
}

//detecte une victoire et dans ce cas reset la game
function detectWinGame(){
	for(let player in listOfPlayers)  {
	  	if(detectWin(listOfPlayers[player])){
			listOfPlayers[player].points += 1;	
			level +=1;
			resetGame();
		}
	}
}

//detecte la victoire pour un joueur
function detectWin(player){
	if((player.x + player.width >= canvasWidth-25) ){
		return true;
  }
  return false
}

//reset la game
function resetGame(){
	createObstacle();
	createCloudObstacle();
	resetAllPos();
}

//reset les positions des joueurs
function resetAllPos(){
	for(let player in listOfPlayers)  {
		listOfPlayers[player].x = 10
		listOfPlayers[player].y = listOfPlayers[player].width*0.75*listOfPlayers[player].id%canvasHeight ;
		io.emit('collapse',{'username' : player ,  'x' : listOfPlayers[player].x, 'y' : listOfPlayers[player].y });
		
	}
}

//detecte les collisions joueurs et obstacles (avions)
function detectAllCollapse(){
	for(let player in listOfPlayers)  {
		for(let obstacle in listOfObstacles){
			if(detectCollapse(listOfPlayers[player], listOfObstacles[obstacle])){
				listOfPlayers[player].x = 10
				listOfPlayers[player].y = listOfPlayers[player].width*0.75*listOfPlayers[player].id%canvasHeight ;
				io.emit('collapse',{'username' : player ,  'x' : listOfPlayers[player].x, 'y' : listOfPlayers[player].y });
			}
		}
  	}
}



//detect la collision entre un joueur et un obstacle avion 
function detectCollapse(player, obstacle){
	if(player.x+player.width < obstacle.x || player.x > obstacle.x+obstacle.Xtaille){
		return false;
	}
	if(player.y+player.height < obstacle.y || player.y > obstacle.y+obstacle.Ytaille){
		return false;
	}
	return true;
}


//traite l'evenement de touche enfoncée
function traiteKeyDown(username , key){
	switch(key) {
	  case "ArrowLeft":
		listOfPlayers[username].vitesseX  = -1;
		break;
	  case "ArrowRight":
		listOfPlayers[username].vitesseX  = 1;
		break;
	  case "ArrowUp":
		listOfPlayers[username].vitesseY  = -1;
		break;
	  case "ArrowDown":
		listOfPlayers[username].vitesseY  = 1;
		break;
	}
}
  
//traite l'evenement de touche relachée
function traiteKeyUp(username , key){
	switch(key) {
		case "ArrowLeft":
			listOfPlayers[username].vitesseX  = 0;
			break;
		case "ArrowRight":
			listOfPlayers[username].vitesseX  = -1;
			break;
		case "ArrowUp":
			listOfPlayers[username].vitesseY  = 0;
			break;
		case "ArrowDown":
			listOfPlayers[username].vitesseY  = 0;
			break;
	}
}

//mouvement d'un joueur
function movePlayer(username){
	if(listOfPositions[username] != undefined){
		listOfPlayers[username].move(delta,speed,listOfPositions[username].x,listOfPositions[username].y);
	}
}

function reconciliation(username){
	if(listOfPositions[username] != undefined){
		if(listOfPlayers[username].x - listOfPositions[username].x > 1){
			listOfPlayers[username].vitesseX = -1;
		}else if (listOfPlayers[username].x - listOfPositions[username].x < 1){
			listOfPlayers[username].vitesseX = 1;
		}else{
			listOfPlayers[username].vitesseX = 0;
		}
		if(listOfPlayers[username].y - listOfPositions[username].y > 1){
			listOfPlayers[username].vitesseY = -1;
		}else if (listOfPlayers[username].y - listOfPositions[username].y < 1){
			listOfPlayers[username].vitesseY = 1 ;
		}else{
			listOfPlayers[username].vitesseY = 0;
		}
	}
}

// LES CONNEXIONS ET ENVOIS DE DONNEE AUX CLIENTS

io.on('connection', (socket) => {
	let emitStamp;
	let connectionStamp = Date.now();

	// Pour le ping/pong mesure de latence
	setInterval(() => {
        emitStamp = Date.now();
        socket.emit("ping");
    },500);

	socket.on("pongo", () => { // "pong" is a reserved event name
		let currentTime = Date.now();
		let timeElapsedSincePing = currentTime - emitStamp;
		let serverTimeElapsedSinceClientConnected = currentTime - connectionStamp;

		//console.log("pongo received, rtt time = " + timeElapsedSincePing);

		socket.emit("data", currentTime, timeElapsedSincePing, serverTimeElapsedSinceClientConnected);
	});

	//les obstacles avions
	socket.on('heartbeat', (newHeartbeat) => {
		nbUpdatesPerSeconds = newHeartbeat ; 
		clearInterval(heartbeat);
		io.emit('updateHeartbeat', socket.username , nbUpdatesPerSeconds);
		heartbeat= setInterval(()=> {
			sendData();
		},1000/nbUpdatesPerSeconds);
		
	});

	//les obstacles avions
	socket.on('getObstacle', () => {
		io.sockets.emit('updateObstacles',listOfObstacles);
	});

	//les obstacles nuages
	socket.on('getCloudObstacle', () => {
		io.sockets.emit('updateCloudObstacles',listOfCloudObstacles);
	});

	//evenement de touche enfoncée
	socket.on('sendActionDown', (data) => {
		traiteKeyDown(data.username , data.key);
	});

	//evenement de touche relachée
	socket.on('sendActionUp', (data) => {
		traiteKeyUp(data.username , data.key);
	});


	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', (data) => {
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.emit('updatechat', socket.username, data);
	});

	// when the client emits 'sendchat', this listens and executes
	socket.on('sendpos', (data) => {
		//listOfPositions[newPos.user] = { 'pos':newPos.pos , 'id' : newPos.id } ; 
		listOfPositions[data.username] = { 'x':data.pos.x , 'y' : data.pos.y } ;
		console.log(listOfPositions);
		// we tell the client to execute 'updatepos' with 2 parameters
		//console.log("recu sendPos");
		//socket.broadcast.emit('updatepos', socket.username, newPos);
		
	});

	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', (username) => {
		// we store the username in the socket session for this client
		// the 'socket' variable is unique for each client connected,
		// so we can use it as a sort of HTTP session
		socket.username = username;
		
		// add the client's username to the global list
		// similar to usernames.michel = 'michel', usernames.toto = 'toto'
		playerNames[username] = username;
		// echo to the current client that he is connected
		socket.emit('updatechat', 'SERVER', 'you have connected');
		// echo to all client except current, that a new person has connected
		socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
		// tell all clients to update the list of users on the GUI
		io.emit('updateusers', playerNames);
		
		//var player = {'x':10, 'y':(playerHeight+50+playerHeight*numbPlayer)%canvasHeight, 'v':1, 'vitesseX':0,'vitesseY':0,'id': numbPlayer, 'name' : username, 'points':0};
		var player = new Player(numbPlayer,username);
		numbPlayer += 1;
		listOfPlayers[username] = player;
		io.emit('updatePlayers',listOfPlayers);
		
		//reset la game quand un nouveau joueur entre en jeu
		resetGame();
	});

	// when the user disconnects.. perform this
	socket.on('disconnect', () => {
		// remove the username from global usernames list
		delete playerNames[socket.username];
				// update list of users in chat, client-side
		io.emit('updateusers', playerNames);

		// Remove the player too
		delete listOfPlayers[socket.username];		
		io.emit('updatePlayers',listOfPlayers);
		
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
	});
});

//Timer 
function timer(currentTime) {
	var delta = currentTime - oldTime;
	oldTime = currentTime;
	return delta/1000;
  }


//Envoie les positions des joueurs 
function sendData(){
	
	io.sockets.emit('updateObstacles',listOfObstacles);
	io.sockets.emit('updateCloudObstacles',listOfCloudObstacles);
	for(let player in listOfPlayers)  {
		io.emit('updatepos',{'username' : player ,  'x' : listOfPlayers[player].x, 'y' : listOfPlayers[player].y });
		io.emit('updatePoints',{'username' : player ,  'points' : listOfPlayers[player].points});
		io.emit('updateLevelCounter', level);
		/*var pos = { 'x':listOfPlayers[newPos.user].x , 'y':listOfPlayers[newPos.user].y };
		socket.emit("lastPos", pos);*/
	}		
}

//HEARTBEAT

var heartbeat = setInterval(()=> {
	sendData();	
	/*gamestate.listOfCloudObstacles = listOfCloudObstacles;
	gamestate.listOfObstacles = listOfObstacles;
	gamestate.listOfPlayers = listOfPlayers;
	gamestate.playerNames = playerNames;
	gamestate.level = level;*/
},1000/nbUpdatesPerSeconds);


//Boucle du serveur pour le calcul des positions 
setInterval(()=> {
	time = Date.now();
	delta = timer(time);
	
	detectAllCollapse();
	movingAllObstacles();
	for(let player in listOfPlayers)  {
		reconciliation(player);
		movePlayer(player);
  	}
	
	detectWinGame();
},calculHeartbeat);

// Delta in seconds, speed in pixels/s
var calcDistanceToMove = function(delta, speed) {
	//console.log("#delta = " + delta + " speed = " + speed);
	return (speed * delta); 
  };