
const Display = function(canvas) {

    this.buffer  = document.createElement("canvas").getContext("2d"),
    this.context = canvas.getContext("2d");
 
    
    this.drawMap = function(image, image_columns, map, map_columns, tile_size) {

      /* The map is passed as an array which holds values for every tile that is drawn on to the canvas. Every value represents a sprite from the spritesheet that needs 
         to be cut out of the image and placed to the x and y coordinates. 
            */
  
      for (let index = map.length - 1; index > -1; -- index) {
  
        let value         = map[index];
        let source_x      =           (value % image_columns) * tile_size;
        let source_y      = Math.floor(value / image_columns) * tile_size;
        let destination_x =           (index % map_columns  ) * tile_size;
        let destination_y = Math.floor(index / map_columns  ) * tile_size;
  
        //image is first drawn to the buffer. every part that changes gets updated in the render function
        this.buffer.drawImage(image, source_x, source_y, tile_size, tile_size, destination_x, destination_y, tile_size, tile_size);
  
      }
  
    };
  
    /*function for drawing specific objects on the canvas like the player. additionaly a width and height is needed for variation of the standard tile size
    as well as math.round functione so the object is drawn to "full pixel locations" so that the image isn't weirdly cropped */
    this.drawObject = function(image, source_x, source_y, destination_x, destination_y, width, height) {
  
      this.buffer.drawImage(image, source_x, source_y, width, height, Math.round(destination_x), Math.round(destination_y), width, height);
  
    };
  
     //resizing the canvas when the browser window changes size. checks if the height_width_ratio hasn't changed. adjusting canvas height and width if necessary. 
    this.resize = function(width, height, height_width_ratio) {
  
      if (height / width > height_width_ratio) {
  
        this.context.canvas.height = width * height_width_ratio;
        this.context.canvas.width  = width;
  
      } else {
  
        this.context.canvas.height = height;
        this.context.canvas.width  = height / height_width_ratio;
  
      }
  
      this.context.imageSmoothingEnabled = false;
  
    };
  
  };
  
  Display.prototype = {
  
    constructor : Display,
    //draws the buffered part of the canvas onto the current (context) canvas 
    render:function() { this.context.drawImage(this.buffer.canvas, 0, 0, this.buffer.canvas.width, this.buffer.canvas.height, 0, 0, this.context.canvas.width, this.context.canvas.height); },
  
  };