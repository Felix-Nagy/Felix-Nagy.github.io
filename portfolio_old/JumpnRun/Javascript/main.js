window.addEventListener("load", function(event) {

  "use strict";


  //Pre and Suffix of the json zone files, in order to avoid redundancies 

  const ZONE_PREFIX = "Javascript/zone";
  const ZONE_SUFFIX = ".json";

   
  // AssetManager to handle Requests for jason files as well as the sprite sheet image 
  const AssetsManager = function() {

    this.tile_set_image = undefined;

  };

  AssetsManager.prototype = {

    constructor: Game.AssetsManager,

    requestJSON:function(url, callback) {

      let request = new XMLHttpRequest();

      request.addEventListener("load", function(event) {

        callback(JSON.parse(this.responseText));

      }, { once:true });

      request.open("GET", url);
      request.send();

    },

    requestImage:function(url, callback) {

      let image = new Image();

      image.addEventListener("load", function(event) {

        callback(image);

      }, { once:true });

      image.src = url;

    },

  };

  
  var menu = function() {
    
  //append the menu elements to the html file as well as stopping the game engine while the menu is active
  
   if(!menuStatus){
  
   document.body.appendChild(menuWrapper);

   menuWrapper.append(menuElement1);
   menuElement1.innerHTML = "Continue";
   menuWrapper.append(menuElement2);
   menuElement2.innerHTML = "Restart";
   menuWrapper.append(menuElement3);
   menuElement3.innerHTML = "Quit"; 
   menuElement3.href = "../index.html";
 
   resize();
   menuStatus = true;
   engine.stop();
    
  }



  
  

  }

  //function to check whethver the player charackter is still alive if not the page reloads

  var gameOver  = function(){
    if(game.world.player.health==-1){
     
       
    location.reload();
    
    }
    
  }

  var keyDownUp = function(event) {

    controller.keyDownUp(event.type, event.keyCode);

  };

  //resizes the canvas, font and the menu if the browser changes size
  var resize = function(event) {

    display.resize(document.documentElement.clientWidth, document.documentElement.clientHeight, game.world.height / game.world.width);
    display.render();

    var rectangle = display.context.canvas.getBoundingClientRect();

    p.style.left = rectangle.left + "px";
    p.style.top  = rectangle.top + "px";

    p.style.fontSize = (game.world.tile_set.tile_size * rectangle.height / game.world.height)/2 + "px";
  
    var mrectangle = menuWrapper.getBoundingClientRect();
    menuElement1.style.fontSize =(game.world.tile_set.tile_size * mrectangle.height / game.world.height)/2.5 + "px";
    menuElement2.style.fontSize =(game.world.tile_set.tile_size * mrectangle.height / game.world.height)/2.5 + "px";
    menuElement3.style.fontSize =(game.world.tile_set.tile_size * mrectangle.height / game.world.height)/2.5 + "px";
   

  };

  var render = function() {

    var frame = undefined;

    display.drawMap   (assets_manager.tile_set_image,
    game.world.tile_set.columns, game.world.graphical_map, game.world.columns,  game.world.tile_set.tile_size);

    //draws every coin of the current zone 

    for (let index = game.world.coins.length - 1; index > -1; -- index) {

      let coin = game.world.coins[index];

      frame = game.world.tile_set.frames[coin.frame_value];

      display.drawObject(assets_manager.tile_set_image,
      frame.x, frame.y,
      coin.x + Math.floor(coin.width * 0.5 - frame.width * 0.5) + frame.offset_x,
      coin.y + frame.offset_y, frame.width, frame.height);

    }

    //rendering the player charackter

    frame = game.world.tile_set.frames[game.world.player.frame_value];

    display.drawObject(assets_manager.tile_set_image,
    frame.x, frame.y,
    game.world.player.x + Math.floor(game.world.player.width * 0.5 - frame.width * 0.5) + frame.offset_x,
    game.world.player.y + frame.offset_y, frame.width, frame.height);
 
    //grass animation frames

    for (let index = game.world.grass.length - 1; index > -1; -- index) {

      let grass = game.world.grass[index];

      frame = game.world.tile_set.frames[grass.frame_value];

      display.drawObject(assets_manager.tile_set_image,
      frame.x, frame.y,
      grass.x + frame.offset_x,
      grass.y + frame.offset_y, frame.width, frame.height);

    }

    //displaying all spikes that can damage the player

    for (let index = game.world.damageBlocks.length - 1; index > -1; -- index) {

      let damageBlock = game.world.damageBlocks[index];

      frame = game.world.tile_set.frames[damageBlock.frame_value];

      display.drawObject(assets_manager.tile_set_image,
      frame.x, frame.y,
      damageBlock.x + frame.offset_x,
      damageBlock.y + frame.offset_y, frame.width, frame.height);

    }

    
    
    //displays the current score and world
    if(game.world.zone_id==0){
      p.innerHTML = "Score  x" + game.world.coin_count +" World x" + game.world.zone_id+ "<br> Move reft and right by either using the a or d key or by touching the space next to the screen ";

    }
    p.innerHTML = "Score  x" + game.world.coin_count +" World x" + game.world.zone_id;
    if(game.world.zone_id==0){
      p.innerHTML = "Score  x" + game.world.coin_count +" World x" + game.world.zone_id+ "<br> ← → to move left or right <br> ↑ to jump  ";

    }

    
    display.render();


  };

  var update = function() {

    //checks which button is pressed
    if (controller.left.active || lpressed ) { game.world.player.moveLeft ();                               }
    if (controller.right.active || rpressed) { game.world.player.moveRight();                               }
    if (controller.up.active || jpressed   ) { game.world.player.jump();      controller.up.active = false; } //jumping is only possible when colliding with the ground
    if (controller.menu.active) {menu(); controller.up.active }
  
  

    game.update();

    gameOver();

    // if the player collides with a door the engine stops, the json zone file gets requested and set up  
    if (game.world.door) {
      
      engine.stop();

      assets_manager.requestJSON(ZONE_PREFIX + game.world.door.destination_zone + ZONE_SUFFIX, (zone) => {

        game.world.setup(zone);

        engine.start();
       

      });

      return;

    } 
    

    

  };



  //objects of the main file
  var assets_manager = new AssetsManager();
  var controller     = new Controller();
  var display        = new Display(document.querySelector("canvas"));
  var game           = new Game();
  var engine         = new Engine(1000/30, render, update);


  //variables

  var canvas         = document.getElementById("canvas");

  var p              = document.createElement("p");
  p.setAttribute("style", "color:#ffffff; font-size:1.em; font-family: 'Roboto Mono' ,monospace; position:fixed;");
  p.innerHTML = "Points: 0";
  document.body.appendChild(p);

  //creating html Elements in order to enable touch controlls 
  var mr = document.getElementById("move-right");
  this.document.body.appendChild(mr)
  var ml = this.document.getElementById("move-left");


  // creating html part of the menu
  var menuWrapper = document.createElement("menuwrapper");
  var menuElement1 = document.createElement("menuElement1");
  menuElement1.setAttribute('class', 'menuelement');
  var menuElement2 = document.createElement("menuElement2");
  menuElement2.setAttribute('class', 'menuelement');
  var menuElement3 = document.createElement("a");
  menuElement3.setAttribute('class', 'menuelement');
  menuElement3.setAttribute('style', 'text-decoration:none;' );


  //booleans to check if the touch buttons are pressed
  var lpressed = false;
  var rpressed = false;
  var jpressed = false;

  //boolean to check if the menu is active
  var menuStatus = false;


 
 
  
  
  //buffer adjust based on the size of the game world
  display.buffer.canvas.height = game.world.height;
  display.buffer.canvas.width  = game.world.width;
  display.buffer.imageSmoothingEnabled = false;


  //setup of the game world gets called
  assets_manager.requestJSON(ZONE_PREFIX + game.world.zone_id + ZONE_SUFFIX, (zone) => {

    game.world.setup(zone);

    assets_manager.requestImage("SpriteSheet.png", (image) => {

      assets_manager.tile_set_image = image;

      resize();
      engine.start();

    });

  });

  // functions to start and stop touch-controlls

  function rstop(){
 
    rpressed = false;
   }

 function lstop(){
 
 lpressed = false;
}
  function moveLeft(){
  
    lpressed = true;
   
    
    }
    
  
  function moveRight(){
    rpressed=true;
  }

  function rstop(){
 
    rpressed = false;
   }

  function jump(){
    game.world.player.jump();
  }
 

//menu options
  
function restart(){
  location.reload();
}

// removing menu elements when the game is started again
function proceed(){
 
  menuWrapper.remove();
  menuElement1.remove();
  menuElement2.remove();
  menuElement3.remove();
  
  resize();
  menuStatus = false;
  engine.start();
    

}

function quit(){
 
}

  //Event Listeners

  //touch
  mr.addEventListener("touchstart", moveRight);
  mr.addEventListener("touchend", rstop);
  
  ml.addEventListener("touchstart", moveLeft);
  ml.addEventListener("touchend", lstop);

  canvas.addEventListener("touchstart", jump) ;

  //menu
  menuElement1.addEventListener("click", proceed);
  menuElement2.addEventListener("click", restart);
  menuElement3.addEventListener("click", quit);
  p.addEventListener("click", menu)
  
  //key Inputs 
  window.addEventListener("keydown", keyDownUp);
  window.addEventListener("keyup"  , keyDownUp);
  window.addEventListener("resize" , resize);

});