const Game = function() {

  // initiating the game world

  this.world    = new Game.World();

  this.update   = function() {

  this.world.update();

  };

};
Game.prototype = { constructor : Game };


Game.Animator = function(frame_set, delay, mode = "loop") {
 
 this.count       = 0;
 this.delay       = (delay >= 1) ? delay : 1; // time that passes until the animation proceeds
 this.frame_set   = frame_set;                // group of frames that belong to an animation
 this.frame_index = 0;                        // current frame of the animation
 this.frame_value = frame_set[0];             // value of the current frame
 this.mode        = mode;                     // frame set either loops or pauses

};
Game.Animator.prototype = {

 constructor:Game.Animator,

 animate:function() {

   switch(this.mode) {

     case "loop" : this.loop(); break;    // calls loop function or
     case "pause":              break;    //pauses at the current frame 

   }

 },

 //setting up the frame setq that should be displayed
 changeFrameSet(frame_set, mode, delay = 20, frame_index = 0) {

   if (this.frame_set === frame_set) { return; }

   this.count       = 0;
   this.delay       = delay;
   this.frame_set   = frame_set;
   this.frame_index = frame_index;
   this.frame_value = frame_set[frame_index];
   this.mode        = mode;

 },

 loop:function() {

  //loops through the frame_set array and sets the corresponding in frame index and value

   this.count ++;

   while(this.count > this.delay) {

     this.count -= this.delay;

     this.frame_index = (this.frame_index < this.frame_set.length - 1) ? this.frame_index + 1 : 0;

     this.frame_value = this.frame_set[this.frame_index];

   }

 }

};

Game.Collider = function() {


  // collision  class that uses the x and y coordinates as well as the size of a tile to check whether the object that is handed in is colliding
  this.collide = function(value, object, tile_x, tile_y, tile_size) {

  // switch case enables different tile types which collide on set sides
    switch(value) {

      case  1:     this.collidePlatformTop    (object, tile_y            ); break;
      case  2:     this.collidePlatformRight  (object, tile_x + tile_size); break;
      case  3: if (this.collidePlatformTop    (object, tile_y            )) return;
                   this.collidePlatformRight  (object, tile_x + tile_size); break;
      case  4:     this.collidePlatformBottom (object, tile_y + tile_size); break;
      case  5: if (this.collidePlatformTop    (object, tile_y            )) return;
                   this.collidePlatformBottom (object, tile_y + tile_size); break;
      case  6: if (this.collidePlatformRight  (object, tile_x + tile_size)) return;
                   this.collidePlatformBottom (object, tile_y + tile_size); break;
      case  7: if (this.collidePlatformTop    (object, tile_y            )) return;
               if (this.collidePlatformBottom (object, tile_y + tile_size)) return;
                   this.collidePlatformRight  (object, tile_x + tile_size); break;
      case  8:     this.collidePlatformLeft   (object, tile_x            ); break;
      case  9: if (this.collidePlatformTop    (object, tile_y            )) return;
                   this.collidePlatformLeft   (object, tile_x            ); break;
      case 10: if (this.collidePlatformLeft   (object, tile_x            )) return;
                   this.collidePlatformRight  (object, tile_x + tile_size); break;
      case 11: if (this.collidePlatformTop    (object, tile_y            )) return;
               if (this.collidePlatformLeft   (object, tile_x            )) return;
                   this.collidePlatformRight  (object, tile_x + tile_size); break;
      case 12: if (this.collidePlatformBottom (object, tile_y + tile_size)) return;
                   this.collidePlatformLeft   (object, tile_x            ); break;
      case 13: if (this.collidePlatformTop    (object, tile_y            )) return;
               if (this.collidePlatformBottom (object, tile_y + tile_size)) return;
                   this.collidePlatformLeft   (object, tile_x            ); break;
      case 14: if (this.collidePlatformBottom (object, tile_y + tile_size)) return;
               if (this.collidePlatformLeft   (object, tile_x            )) return;
                   this.collidePlatformRight  (object, tile_x + tile_size); break;
      case 15: if (this.collidePlatformTop    (object, tile_y            )) return;
               if (this.collidePlatformBottom (object, tile_y + tile_size)) return;
               if (this.collidePlatformLeft   (object, tile_x            )) return;
                   this.collidePlatformRight  (object, tile_x + tile_size); break;

    }

  }

};
Game.Collider.prototype = {

  constructor: Game.Collider,

  collidePlatformBottom:function(object, tile_bottom) {

    if (object.getTop() < tile_bottom && object.getOldTop() >= tile_bottom) {

      object.setTop(tile_bottom);
      object.velocity_y = 0;
      return true;

    } return false;

  },

  // functions to check with which side the object is colliding. If a collision is detected the velocity has to be turned to zero 

  collidePlatformLeft:function(object, tile_left) {

    if (object.getRight() > tile_left && object.getOldRight() <= tile_left) {

      object.setRight(tile_left - 0.01);
      object.velocity_x = 0;
      return true;

    } return false;

  },

  collidePlatformRight:function(object, tile_right) {

    if (object.getLeft() < tile_right && object.getOldLeft() >= tile_right) {

      object.setLeft(tile_right);
      object.velocity_x = 0;
      return true;

    } return false;

  },

  collidePlatformTop:function(object, tile_top) {

    if (object.getBottom() > tile_top && object.getOldBottom() <= tile_top) {

      object.setBottom(tile_top - 0.01);
      object.velocity_y = 0;
      object.jumping    = false;
      return true;

    } return false;

  }

 };


// Frame class to help dispay single frames of an animation

Game.Frame = function(x, y, width, height, offset_x = 0, offset_y = 0) {

// initializing coordinates, size and offset of a frame
  this.x        = x;
  this.y        = y;
  this.width    = width;
  this.height   = height;
  this.offset_x = offset_x;
  this.offset_y = offset_y;

};
Game.Frame.prototype = { constructor: Game.Frame };


// creating a basic object class with a size and coordinates on the canvas to be inherited by the tiles and entities of the game world
Game.Object = function(x, y, width, height) {

 this.height = height;
 this.width  = width;
 this.x      = x;
 this.y      = y;

};
Game.Object.prototype = {

  constructor:Game.Object,


  collideObject:function(object) {

    //checks if the object is colliding with any part of the game world
    if (this.getRight()  < object.getLeft()  ||
        this.getBottom() < object.getTop()   ||
        this.getLeft()   > object.getRight() ||
        this.getTop()    > object.getBottom()) return false;

    return true;

  },


  collideObjectCenter:function(object) {

    // same check like before butt only with the center of the object 
    let center_x = object.getCenterX();
    let center_y = object.getCenterY();

    if (center_x < this.getLeft() || center_x > this.getRight() ||
        center_y < this.getTop()  || center_y > this.getBottom()) return false;

    return true;

  },

  //getter and setter functions of the game world objects
  getBottom : function()  { return this.y + this.height;       },
  getCenterX: function()  { return this.x + this.width  * 0.5; },
  getCenterY: function()  { return this.y + this.height * 0.5; },
  getLeft   : function()  { return this.x;                     },
  getRight  : function()  { return this.x + this.width;        },
  getTop    : function()  { return this.y;                     },
  setBottom : function(y) { this.y = y - this.height;          },
  setCenterX: function(x) { this.x = x - this.width  * 0.5;    },
  setCenterY: function(y) { this.y = y - this.height * 0.5;    },
  setLeft   : function(x) { this.x = x;                        },
  setRight  : function(x) { this.x = x - this.width;           },
  setTop    : function(y) { this.y = y;                        }

};

//moving object with the addition of a velocity, a way to track if it'ts jumping or not and the previos x and y positions
Game.MovingObject = function(x, y, width, height, velocity_max = 105) {

  Game.Object.call(this, x, y, width, height);

  this.jumping      = false;
  this.velocity_max = velocity_max;
  this.velocity_x   = 0;
  this.velocity_y   = 0;
  this.x_old        = x;
  this.y_old        = y;

};

//using previous x and y coordinates in order to prevent the object from missing collisions 
Game.MovingObject.prototype = {

  getOldBottom : function()  { return this.y_old + this.height;       },
  getOldCenterX: function()  { return this.x_old + this.width  * 0.5; },
  getOldCenterY: function()  { return this.y_old + this.height * 0.5; },
  getOldLeft   : function()  { return this.x_old;                     },
  getOldRight  : function()  { return this.x_old + this.width;        },
  getOldTop    : function()  { return this.y_old;                     },
  setOldBottom : function(y) { this.y_old = y    - this.height;       },
  setOldCenterX: function(x) { this.x_old = x    - this.width  * 0.5; },
  setOldCenterY: function(y) { this.y_old = y    - this.height * 0.5; },
  setOldLeft   : function(x) { this.x_old = x;                        },
  setOldRight  : function(x) { this.x_old = x    - this.width;        },
  setOldTop    : function(y) { this.y_old = y;                        }

};
Object.assign(Game.MovingObject.prototype, Game.Object.prototype);
Game.MovingObject.prototype.constructor = Game.MovingObject;

  //allows to create different kinds of background animtion in each zone based on the frame set that is handed in 
  Game.graphicElement = function(x, y,animation) {
    
  Game.Object.call(this, x, y, 256, 256);

  this.x = x;
  this.y = y;

  if (animation == "wave")
  Game.Animator.call(this, Game.graphicElement.prototype.frame_sets["wave"], 30);
  

  

};
Game.graphicElement.prototype = {

  frame_sets: {

    "wave":[21,22,23]

  }

};
Object.assign(Game.graphicElement.prototype, Game.Animator.prototype);
Object.assign(Game.graphicElement.prototype, Game.Object.prototype);
Game.graphicElement.prototype.constructor = Game.graphicElement;


// object with coordinates, size, an animation and a collider 
Game.damageBlock = function(x,y) {

  Game.Object.call(this, x, y , 240, 10);
  Game.Animator.call(this, Game.damageBlock.prototype.frame_sets["spike"],100 );
 this.x = x;
 this.y = y;

};
Game.damageBlock.prototype = {

  frame_sets: { "spike":[28] }

};
Object.assign(Game.damageBlock.prototype, Game.Animator.prototype);
Object.assign(Game.damageBlock.prototype, Game.Object.prototype);
Game.damageBlock.prototype.constructor = Game.damageBlock;



// collectible in the game same functionality as the damage block, main difference is the animation and the randomisation of it's location 
Game.coin = function(x, y) {

  Game.Object.call(this, x, y, 150, 150);
  Game.Animator.call(this, Game.coin.prototype.frame_sets["twirl"], 20);

  this.frame_index = Math.floor(Math.random() * 2);

  
  this.base_x     = x;
  this.base_y     = y;
  this.position_x = Math.random() * Math.PI * 2;
  this.position_y = this.position_x * 2;

};
Game.coin.prototype = {

  frame_sets: { "twirl":[23,24,25,26,27,26,25,24,23] },

  updatePosition:function() {

    this.position_x += 0.1;
    this.position_y += 0.2;

    this.x = this.base_x + Math.cos(this.position_x) * 2;
    this.y = this.base_y + Math.sin(this.position_y);

  }

};
Object.assign(Game.coin.prototype, Game.Animator.prototype);
Object.assign(Game.coin.prototype, Game.Object.prototype);
Game.coin.prototype.constructor = Game.coin;


// one possibility to integrate a background animation (gets integrated in the graphic element class later)
  Game.Grass = function(x, y) {
  Game.Object.call(this, x, y, 14, 28);
  Game.Animator.call(this, Game.Grass.prototype.frame_sets["wave"], 30);

  this.x = x;
  this.y = y;

};
Game.Grass.prototype = {

  frame_sets: {

    "wave":[20, 22, 21,22]

  }

};
Object.assign(Game.Grass.prototype, Game.Animator.prototype);
Object.assign(Game.Grass.prototype, Game.Object.prototype);


// a door that also has a postion and size that in addition has a destination- zone and xy coordinates
Game.Door = function(door) {

 Game.Object.call(this, door.x, door.y, door.width, door.height);

 this.destination_x    = door.destination_x;
 this.destination_y    = door.destination_y;
 this.destination_zone = door.destination_zone;

};
Game.Door.prototype = {};
Object.assign(Game.Door.prototype, Game.Object.prototype);
Game.Door.prototype.constructor = Game.Door;


//player class which inherits the attributes of the moving object class
//x and y direction to define the direction of the animations, as well as a health value as an game over condition 
Game.Player = function(x, y) {

  Game.MovingObject.call(this, x, y, 50, 256);

  Game.Animator.call(this, Game.Player.prototype.frame_sets["idle-right"], 24);

  this.jumping     = true;
  this.direction_x = 1;
  this.direction_y = 1;
  this.velocity_x  = 0;
  this.velocity_y  = 0;
  this.health      = 1; 


};
Game.Player.prototype = {

  frame_sets: {

    "idle-right" : [0,16],
    "walk-right" : [1,2,3,4,5,6,7],
    "stop-right" : [1,2,5,7],
    "jump-right" : [18],
    "idle-left"  : [8,17],
    "walk-left"  : [9,10,11,12,13,15],
    "stop-left" : [9,10,13,15],
    "jump-left" : [19],
    "run-right"   : [29,30,31,32,32,33,34],
    "run-left"   : [35,36,37,38,39,40]

    
  },

  
 

  jump: function() {

 
    if (!this.jumping && this.velocity_y < 10) {

      this.jumping     = true;
      this.velocity_y -= 970;
      this.direction_y = 1;
      

    }

  },

  moveLeft: function() {

    this.direction_x = -1;
    this.velocity_x -= 7.6;
  
    this.direction_y = 1;

  },

  moveRight:function(frame_set) {

    this.direction_x = 1;
    this.velocity_x += 7.6;
    this.direction_y = 1;

  },
  crouch:function(frame_set) {

    this.direction_y = -1;
    this.velocity_x = 0;
    
  },
  
  menu:function(){
  
    if(!this.menuStatus){
    this.menuStatus = true;
    }
    else  this.menuStatus = false;
  }
  ,

  updateAnimation:function() {
 

    // the jump animation is only called when the y velocity is negative = player moves from bottom to the top of the canvas 
    if (this.velocity_y < 0) {
      
      if (this.direction_x < 0) this.changeFrameSet(this.frame_sets["jump-left"], "pause");
      else this.changeFrameSet(this.frame_sets["jump-right"], "pause");

    }
  
    //checking in which direction the player is facing and whether he's jumping or not so he can't walk while in the air 
     else if (this.direction_x < 0&&!this.jumping) {

      //the walking animation gets called when the player is moving slowly. If he exceeds a certain velocity it changes to running
     if (this.velocity_x <-29) this.changeFrameSet(this.frame_sets["run-left"], "loop", 2);
     else if (this.velocity_x < -0.1 ) this.changeFrameSet(this.frame_sets["walk-left"], "loop", 4);
      
     
      else this.changeFrameSet(this.frame_sets["idle-left"], "loop",18);

    }
   
      else if (this.direction_x > 0&&!this.jumping) {

      if (this.velocity_x > 29) this.changeFrameSet(this.frame_sets["run-right"], "loop", 2);
      else if (this.velocity_x > 0.1) this.changeFrameSet(this.frame_sets["walk-right"], "loop", 4);
     

      else this.changeFrameSet(this.frame_sets["idle-right"], "loop",18);

    }
    
    

    this.animate();

  },

  // adjusting the postion based on the gravity and friction to emulate real world movement as well as capping the maximum possible velocity
  updatePosition:function(gravity, friction) {

    this.x_old = this.x;
    this.y_old = this.y;

    this.velocity_y += gravity;
    this.velocity_x *= friction;

    
    if (Math.abs(this.velocity_x) > this.velocity_max)
    this.velocity_x = this.velocity_max * Math.sign(this.velocity_x);

    if (Math.abs(this.velocity_y) > this.velocity_max)
    this.velocity_y = this.velocity_max * Math.sign(this.velocity_y);

    this.x    += this.velocity_x;
    this.y    += this.velocity_y;

  },
 
  

};
Object.assign(Game.Player.prototype, Game.MovingObject.prototype);
Object.assign(Game.Player.prototype, Game.Animator.prototype);
Game.Player.prototype.constructor = Game.Player;
 
Game.TileSet = function(columns, tile_size) {

  this.columns    = columns;
  this.tile_size  = tile_size;

  let f = Game.Frame;

  // all frames used in the game animator are stored in this array

  this.frames = [new f(0, 0, 256, 256, 0, 0), // idle-right
    new f(256, 0, 256, 256, 0, 0), new f(512, 0, 256, 256, 0, 0), new f(768, 0, 256, 256, 0, 0), new f(1024, 0, 256, 256, 0, 0), new f(1280, 0, 256, 256, 0, 0),
    new f(1536, 0, 256, 256, 0, 0), new f(1792, 0, 256, 256, 0, 0), // walk-right
    new f(0, 256, 256, 256, 0, 0), // idle-left
    new f(1792, 256, 256, 256, 0, 0), new f(1536, 256, 256, 256, 0, 0), new f(1280, 256, 256, 256, 0, 0), new f(1024, 256, 256, 256, 0, 0), new f(768, 256, 256, 256, 0, 0),
    new f(512, 256, 256, 256, 0, 0),  new f(256, 256, 256, 256, 0, 0), //walk-left
    new f(0, 512, 256, 256, 0, 0),  // idle-right-animation
    new f(1792, 768, 256, 256, 0, 0), // idle-left-animation
    new f(256, 512, 256, 256, 0, 0), //jump-right
    new f(1536, 768, 256, 256, 0, 0), //jump-left
    new f(1792, 1280, 256, 57,0,-64), new f(1792, 1377, 256, 57,0,-64),   new f(1792, 1482, 256, 54,0,-64), // wave
    new f(768, 2048, 256, 245,0,0), new f(1024, 2048, 256, 245,0,0),   new f(1280, 2048, 256, 245,0,0), new f(1536, 2048, 256, 245,0,0), new f(1792, 2048, 256, 245,0,0), // orb animation
    new f(1792, 2304, 256, 256,0,-140),  // spike
    new f(512,512,256,256),  new f(768,512,256,256), new f(1024,512,256,256), new f(1280,512,256,256),new f(1536,512,256,256),new f(1792,512,256,256), // run-right
    new f(1280, 768, 256, 256, 0, 0), new f(1024, 768, 256, 256, 0, 0), new f(768, 768, 256, 256, 0, 0), new f(512, 768, 256, 256, 0, 0),  new f(256, 768, 256, 256, 0, 0),  new f(0, 768, 256, 256, 0, 0)//run-left

    
    
    
    ];

};
Game.TileSet.prototype = { constructor: Game.TileSet };

//setup of the game world: sporn coordinates of the player, gravity, friciton, size of the map and size of the tile_set  

Game.World = function(friction = 0.84, gravity =12) {

  this.collider     = new Game.Collider();

  this.friction     = friction;
  this.gravity      = gravity;

  this.columns      = 12;
  this.rows         = 9;

  this.tile_set     = new Game.TileSet(8, 256);
  this.player       = new Game.Player(100, 1790);

  this.zone_id      = "00"; 

  this.coins        = []; 
  this.coin_count   = 0;
  this.doors        = [];
  this.door         = undefined;




  this.height       = this.tile_set.tile_size * this.rows;
  this.width        = this.tile_set.tile_size * this.columns;

  
};
Game.World.prototype = {

  constructor: Game.World,






  collideObject:function(object) {

    // checks if the player object is colliding with a tile of the collision map

    var bottom, left, right, top, value;

    top    = Math.floor(object.getTop()    / this.tile_set.tile_size);
    left   = Math.floor(object.getLeft()   / this.tile_set.tile_size);
    value  = this.collision_map[top * this.columns + left];
    this.collider.collide(value, object, left * this.tile_set.tile_size, top * this.tile_set.tile_size, this.tile_set.tile_size);

    top    = Math.floor(object.getTop()    / this.tile_set.tile_size);
    right  = Math.floor(object.getRight()  / this.tile_set.tile_size);
    value  = this.collision_map[top * this.columns + right];
    this.collider.collide(value, object, right * this.tile_set.tile_size, top * this.tile_set.tile_size, this.tile_set.tile_size);

    bottom = Math.floor(object.getBottom() / this.tile_set.tile_size);
    left   = Math.floor(object.getLeft()   / this.tile_set.tile_size);
    value  = this.collision_map[bottom * this.columns + left];
    this.collider.collide(value, object, left * this.tile_set.tile_size, bottom * this.tile_set.tile_size, this.tile_set.tile_size);

    bottom = Math.floor(object.getBottom() / this.tile_set.tile_size);
    right  = Math.floor(object.getRight()  / this.tile_set.tile_size);
    value  = this.collision_map[bottom * this.columns + right];
    this.collider.collide(value, object, right * this.tile_set.tile_size, bottom * this.tile_set.tile_size, this.tile_set.tile_size);

    
    Object.assign(Game.World.prototype, Game.World.prototype);
    Game.World.prototype.constructor = Game.World;

  },


  //using the json file to fill the game world with it's objects as well as the graphic and collision map
  //it' also possible to change the size of the tile_set in the current zone 
  setup:function(zone) {
    this.graphicElements     = new Array();
    this.damageBlocks       = new Array();
    this.coins              = new Array();
    this.doors              = new Array();
    this.grass              = new Array();
    this.collision_map      = zone.collision_map;
    this.graphical_map      = zone.graphical_map;
    this.columns            = zone.columns;
    this.rows               = zone.rows;
    this.zone_id            = zone.id;
  
    //looping through every game world object stored in the json file and placing it into the current instance of the game 

    for (let index = zone.graphicElements.length - 1; index > -1; -- index) {

      let graphicElement = zone.graphicElements[index];
      this.graphicElements[index] = new Game.graphicElement(graphicElement[0] * this.tile_set.tile_size, graphicElement[1] * this.tile_set.tile_size + 12);

    }

  for (let index = zone.damageBlocks.length - 1; index > -1; -- index) {

      let damageBlock = zone.damageBlocks[index]; 
      this.damageBlocks[index] = new Game.damageBlock(damageBlock[0]*this.tile_set.tile_size +10   , damageBlock[1]*this.tile_set.tile_size +140 );
      
    
    } 

    for (let index = zone.coins.length - 1; index > -1; -- index) {

      let coin = zone.coins[index];
      this.coins[index] = new Game.coin(coin[0] * this.tile_set.tile_size +80, coin[1] * this.tile_set.tile_size - 2);
      


    }

    for (let index = zone.grass.length - 1; index > -1; -- index) {

      let grass = zone.grass[index];
      this.grass[index] = new Game.Grass(grass[0] * this.tile_set.tile_size, grass[1] * this.tile_set.tile_size + 12);

    }


    for (let index = zone.doors.length - 1; index > -1; -- index) {

      let door = zone.doors[index];
      this.doors[index] = new Game.Door(door);

    }

    
    if (this.door) {

      if (this.door.destination_x != -1) {

        this.player.setCenterX   (this.door.destination_x);
        this.player.setOldCenterX(this.door.destination_x);

      }

      if (this.door.destination_y != -1) {

        this.player.setCenterY   (this.door.destination_y);
        this.player.setOldCenterY(this.door.destination_y);

      }

      this.door = undefined;

    }

  },

  // in the update function the update position function of the player get's called
  // the coin, door, damageBlock objects are constantly checking for collision with the player and responding with their coresponding functions 

  update:function() {

    this.player.updatePosition(this.gravity, this.friction);

    this.collideObject(this.player);

    

    for (let index = this.coins.length - 1; index > -1; -- index) {

      let coin = this.coins[index];

      coin.updatePosition();
      coin.animate();

      if (coin.collideObject(this.player)) {

        this.coins.splice(this.coins.indexOf(coin), 1);
        this.coin_count ++;
        
      

      }

    }

    for(let index = this.doors.length - 1; index > -1; -- index) {

      let door = this.doors[index];

      if (door.collideObjectCenter(this.player)) {

        this.door = door;

      };

    }

    for (let index = this.grass.length - 1; index > -1; -- index) {

      let grass = this.grass[index];

      grass.animate();


    }
    for (let index = this.graphicElements.length - 1; index > -1; -- index) {

      let graphicElement = this.graphicElements[index];

      graphicElement.animate();


    }

    for (let index = this.damageBlocks.length - 1; index > -1; -- index) {


      let damageBlock = this.damageBlocks[index];
    
      
    
    
      

      if (damageBlock.collideObject(this.player)) {
       this.player.health = -1; 
        
      }
      
    }

    if(this.player.y >3300||this.player.x >3200||this.player.x <-60) {
      this.player.health = -1; 
 
    }
    
   
    this.player.updateAnimation();
  
  
  
    
 

  }

};