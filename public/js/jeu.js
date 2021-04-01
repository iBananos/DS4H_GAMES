let canvas, ctx, mousePos;
let colorList = ['#FF6833','#FFBD33','#FFE333','#ADFF33','#33FFAD','#33DCFF','#335FFF','#9133FF']
let target = {x:1000-25, y:500, tailleX:400, tailleY:400, color:'green'};
let speed = 100; 
var playerWidth = 75;
var playerHeight = playerWidth*0.75;
var level = 1 ;
// les images du jeu
var plane1=new Image();
plane1.src="./assets/plane_1_blue.png";
var plane2=new Image();
plane2.src="./assets/plane_1_pink.png";
var plane3=new Image();
plane3.src="./assets/plane_1_red.png";
var plane4=new Image();
plane4.src="./assets/plane_1_yellow.png";
var damier=new Image();
damier.src="./assets/damier.jpg";
var Cloud=new Image();
Cloud.src="./assets/Cloud.png";
var player1=new Image();
player1.src="./assets/plane_2_blue.png";
var player2=new Image();
player2.src="./assets/plane_2_green.png";
var player3=new Image();
player3.src="./assets/plane_2_red.png";
var player4=new Image();
player4.src="./assets/plane_2_yellow.png";
var ghostPic=new Image();
ghostPic.src="./assets/ghost_2.png";
var tabImage = [plane1,plane2,plane3,plane4];
var tabPlayer = [player1,player2,player3,player4];
var ghost = {'x':10 ,'y':10};
// les joueurs et obstacles 
let allPlayers = {};
let allObstacles = {};
let listOfCloudObstacles = {};

// pour le calcul du temps
let delta, oldTime = 0;


function startGame() {
  console.log("init");
  canvas = document.querySelector("#myCanvas");
  ctx = canvas.getContext('2d');
  allObstacles = {} ;
  // Les écouteurs
  window.addEventListener("keydown",traiteKeyDown);
  window.addEventListener("keyup",traiteKeyUp);
  requestAnimationFrame(animationLoop);
  
}

//LES DATAS RECUPEREE DU SERVEUR 

function collapseServer(player){
  if(allPlayers[player.username] != undefined){
    allPlayers[player.username].x = player.x;
    allPlayers[player.username].y = player.y;
  }
}
//update les joueurs
function updatePlayers(listOfPlayers) {
  allPlayers = listOfPlayers;
  allPlayers[username].vitesseX = 0;
  allPlayers[username].vitesseY = 0;
}

//update la position des joueurs
function updatePlayerNewPos(data) {
  if(allPlayers[data.username] != undefined){
    if(data.username == username){
      ghost.x = data.x;
      ghost.y = data.y;
    }else{
    allPlayers[data.username].x = data.x;
    allPlayers[data.username].y = data.y;
    }
  }
}

//update le score des joueurs
function updatePlayerPoints(newPoints){
  if(allPlayers[newPoints.username] != undefined){
    allPlayers[newPoints.username].points = newPoints.points;
    }
}

//update le numéro du level en cas de victoire d'un joueur
function updateLevelCounter(newLevel){
  level = newLevel;
  document.getElementById("bandeauLevel").innerHTML = 'Niveau '+level;
}

//update les obstacles avions
function updateObstacles(listObstacles) {
  allObstacles = listObstacles;
}

//update les obstacles nuages
function updateCloudObstacles(listCloudObstacles) {
  listOfCloudObstacles = listCloudObstacles;
}

// LES METHODES D'AFFICHAGE

//dessine la dernière position calculée par le serveur 

function drawGhost(){
  ctx.strokeRect(ghost.x, ghost.y, playerWidth, playerHeight);
  /*
  ctx.shadowColor = 'black';
  ctx.shadowBlur = 40;
  ctx.lineJoin = 'bevel';
  ctx.lineWidth = 0;
  ctx.strokeStyle = 'transparent';*/
  
  ctx.drawImage(ghostPic,ghost.x, ghost.y, playerWidth, playerHeight);
  //ctx.fillText('LAST POS', ghost.x, ghost.y);
}

//dessine les joueurs
function drawAllPlayers() {
  for(let name in allPlayers) {
    drawPlayer(allPlayers[name]);
  }
}

//dessine un joueur
function drawPlayer(player) {
  ctx.strokeRect(player.x, player.y, playerWidth, playerHeight);
  
  ctx.shadowColor = colorList[player.id%4];
  ctx.shadowBlur = 20;
  ctx.lineJoin = 'bevel';
  ctx.lineWidth = 0;
  ctx.strokeStyle = 'transparent';
  
  ctx.drawImage(tabPlayer[player.id%4],player.x, player.y, playerWidth, playerHeight);
  ctx.font = 'bold 20px Verdana, Arial, serif';
  ctx.shadowBlur = 0;
  ctx.fillStyle = colorList[player.id%4];
  ctx.fillText(player.name +" " + player.points + " pts", player.x, player.y);
}
//dessine la cible
function drawTarget() {
  ctx.fillStyle = target.color;
  ctx.fillRect(target.x, 0, target.tailleX, canvas.height);
  ctx.shadowColor = 'yellow';
  ctx.shadowBlur = 20;
  ctx.lineJoin = 'bevel';
  ctx.lineWidth = 0;
  ctx.strokeStyle = 'transparent';
  ctx.drawImage(damier,target.x, 0, 400, canvas.height);
}

//dessine les obstacles
function drawAllObstacle() {
  let i = 0 ;
  for(let obstacle in allObstacles)  {
    drawObstacle(allObstacles[obstacle],i);
    i++;
  }
  for(let Cloud in listOfCloudObstacles){
    drawCloudObstacle(listOfCloudObstacles[Cloud]);
  }
}

//dessine un obstacle (avion)
function drawObstacle(obstacle,i){  
  ctx.strokeRect(obstacle.x, obstacle.y, obstacle.Xtaille, obstacle.Ytaille);
  console.log(obstacle.x , obstacle.y , obstacle.Xtaille , obstacle.Ytaille);
  ctx.shadowColor = 'red';
  ctx.shadowBlur = 20;
  ctx.lineJoin = 'bevel';
  ctx.lineWidth = 0;
  ctx.strokeStyle = 'transparent';
  ctx.drawImage(tabImage[i%4],obstacle.x,obstacle.y,obstacle.Xtaille, obstacle.Ytaille);
}

//dessine un obstacle (nuage)
function drawCloudObstacle(obstacle){  
  ctx.strokeRect(obstacle.x, obstacle.y, obstacle.Xtaille, obstacle.Ytaille);
  ctx.shadowColor = 'white';
  ctx.shadowBlur = 20;
  ctx.lineJoin = 'bevel';
  ctx.lineWidth = 0;
  ctx.strokeStyle = 'transparent';
  ctx.drawImage(Cloud,obstacle.x,obstacle.y,obstacle.Xtaille, obstacle.Ytaille);
}

// LES COLLISIONS

/*
//detecte les collisions entre joueurs et obstacles (avions)
function detectAllCollapse(){
	for(let player in allPlayers)  {
		for(let obstacle in allObstacles){
			if(detectCollapse(allPlayers[player], allObstacles[obstacle])){
				allPlayers[player].x = 10;
				allPlayers[player].y = playerWidth*0.75*allPlayers[player].id%canvas.height ;
			}
		}
  }
}*/

/*
//detecte une victoire et dans ce cas reset la game
function detectWinGame(){
	for(let player in allPlayers)  {
	  	if(detectWin(allPlayers[player])){
        allPlayers[player].x = 10;
				allPlayers[player].y = playerWidth*0.75*allPlayers[player].id%canvas.height ;
		}
	}
}

//detecte la victoire pour un joueur
function detectWin(player){
	if((player.x + playerWidth >= canvas.width-25) ){
		return true;
  }
  return false
}*/

//detecte les collisions entre un joueur et un obstacle (avion)
/*
function detectCollapse(player, obstacle){
	if(player.x+playerWidth < obstacle.x || player.x > obstacle.x+obstacle.Xtaille){
		return false;
	}
	if(player.y+playerHeight < obstacle.y || player.y > obstacle.y+obstacle.Ytaille){
		return false;
	}
	return true;
}
*/

// LES MOUVEMENTS


//action touche appuyée
function traiteKeyDown(event){
  switch(event.key) {
    case "ArrowLeft":
      allPlayers[username].vitesseX  = -1;
      break;
    case "ArrowRight":
      allPlayers[username].vitesseX  = 1;
      break;
    case "ArrowUp":
      allPlayers[username].vitesseY  = -1;
      break;
    case "ArrowDown":
      allPlayers[username].vitesseY  = 1;
      break;
  }
  var  data = { "username" : username, "key" :event.key}
  //socket.emit('sendActionDown', data);
  send('sendActionDown', data);
}

//action touche relachée
function traiteKeyUp(event){
  switch(event.key) {
    case "ArrowLeft":
      allPlayers[username].vitesseX  = 0;
      break;
    case "ArrowRight":
      allPlayers[username].vitesseX  = -1;
      break;
    case "ArrowUp":
      allPlayers[username].vitesseY  = 0;
      break;
    case "ArrowDown":
      allPlayers[username].vitesseY  = 0;
      break;
  }
  var  data = { "username" : username, "key" :event.key}
  //socket.emit('sendActionUp', data);
  send('sendActionUp', data);
}

//mouvement d'un joueur
function movePlayer(username){
  if(allPlayers[username] != undefined){
  var distX = calcDistanceToMove(delta, allPlayers[username].vitesseX*speed);
  var distY = calcDistanceToMove(delta, allPlayers[username].vitesseY*speed);
  
    if((allPlayers[username].x + distX+playerWidth<canvas.width) && (allPlayers[username].x+distX>0)){
      allPlayers[username].x += distX;
    }else{
      allPlayers[username].vitesseX = 0;
    }
    if((allPlayers[username].y+distY+playerHeight<canvas.height) && (allPlayers[username].y+distY>0)){
      allPlayers[username].y += distY;
    }else{
      allPlayers[username].vitesseY = 0;
    }
  
  //socket.emit("sendpos", { user: username, pos: allPlayers[username]});
  var data = { 'username' : username, 'pos' : {'x': allPlayers[username].x, 'y':allPlayers[username].y} , 'id' : Date.now() };
  send("sendpos", data);
}
}

//mouvement des obstacles
function movingAllObstacles(){
	for(let obstacle in allObstacles)  {
	  movingObstacles(allObstacles[obstacle]);
	}
	for(let obstacle in listOfCloudObstacles)  {
		movingCloudObstacles(listOfCloudObstacles[obstacle]);
	}
}

//mouvement d'un nuage
function movingCloudObstacles(obstacle){
	  if(obstacle.x+obstacle.Xtaille < 0){
		  obstacle.x = canvas.width + obstacle.id*200; 
		  obstacle.y = (obstacle.y+300)%canvas.height;
	  }else{
	  obstacle.x += calcDistanceToMove(delta,obstacle.vitesseX*speed); 
	  }
}

//mouvement d'un avion
function movingObstacles(obstacle){
	if((obstacle.y+obstacle.vitesseY+obstacle.Ytaille<canvas.height) && (obstacle.y+obstacle.vitesseY>0)){
	  obstacle.y += calcDistanceToMove(delta,obstacle.vitesseY*speed);
	}else{
	  obstacle.vitesseY = -obstacle.vitesseY;
	}
	if((obstacle.x + obstacle.vitesseX+obstacle.Xtaille<canvas.width) && (obstacle.x+obstacle.vitesseX>100)){
	  obstacle.x += calcDistanceToMove(delta,obstacle.vitesseX*speed);
	}else{
	  obstacle.vitesseX = -obstacle.vitesseX;
	}
}

//Timer 
function timer(currentTime) {
  var delta = currentTime - oldTime;
  oldTime = currentTime;
  return delta/1000;
}

//Loop d'animation pour le jeu 
function animationLoop(time) {
  if(!oldTime) {
    oldTime = time;
    requestAnimationFrame(animationLoop);
  }

  delta = timer(time);

  if(username != undefined ) {
    // 1 On efface l'écran
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 2 On dessine des objets
    drawTarget();
    movePlayer(username);
    drawGhost();
    drawAllPlayers();
    movingAllObstacles();
    drawAllObstacle();
    //detectWinGame();
    //detectAllCollapse();
    
  }
  // 3 On rappelle la fonction d'animation à 60 im/s
  requestAnimationFrame(animationLoop);
}

// Delta in seconds, speed in pixels/s
var calcDistanceToMove = function(delta, speed) {
  //console.log("#delta = " + delta + " speed = " + speed);
  return (speed * delta); 
};