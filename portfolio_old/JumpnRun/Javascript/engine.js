const Engine = function(time_step, update, render) {

    this.accumulated_time        = 0; // time has passed since the last update
    this.animation_frame_request = undefined, //reference to the Animation Frame Request
    this.time                    = undefined, // most recent timestamp of the loop
    this.time_step               = time_step, // update-rate optimal at 1000/30 = 30 frames
  
    this.updated = false;  //Boolean whether the update-function has been called since the last cycle
  
    this.update = update;
    this.render = render; // update and render functions from main.js
  
    this.run = function(time_stamp) {
  
       //current time_stamp is handed in by RequestAnimationFrame
      this.animation_frame_request = window.requestAnimationFrame(this.handleRun);
  
      this.accumulated_time += time_stamp - this.time;
      this.time = time_stamp;
  
       /*In the case the decive is too slow and can't call the update function often enough 
      an guaranteed update is needed befor too many frames(3) have passed without an update  */

      if (this.accumulated_time >= this.time_step * 3) {
  
        this.accumulated_time = this.time_step;
  
      }

       /*updates are only possible when the screen is ready to draw and the requestAnimation Frame calls the run
      function so it's necessary to update the game every time the accumulated_time is bigger then the time-step*/
  
      while(this.accumulated_time >= this.time_step) {
  
        this.accumulated_time -= this.time_step;
  
        this.update(time_stamp);
  
        this.updated = true;
  
      }

      //only draws when the game has updated
      if (this.updated) {
  
        this.updated = false;
        this.render(time_stamp);
  
      }
  
    };
  
     /*calls the run methode of the engine, => arrow function is needed because the 'this' keyword will point to the object your passing
       it to(in this case the window). This needs to refer to the engine object */ 

    this.handleRun = (time_step) => { this.run(time_step); };
  
  };
  
  Engine.prototype = {
  
    constructor:Engine,
  
    start:function() {
  
      this.accumulated_time = this.time_step;
      this.time = window.performance.now();

      /*tells the browser to perform an animation and requests that the browser calls a
        function (handleRun) to update an Animation before the canvas is repainted*/ 

      this.animation_frame_request = window.requestAnimationFrame(this.handleRun);
  
    },
    
    //no more AnimationFrameRequests are being handed in => engine stops udpating
    stop:function() { window.cancelAnimationFrame(this.animation_frame_request); }
  
  };