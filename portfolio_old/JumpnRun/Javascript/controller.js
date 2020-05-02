
const Controller = function () {

    //own class for every possible buttoninput

    this.left = new Controller.ButtonInput();
    this.right = new Controller.ButtonInput();
    this.up = new Controller.ButtonInput();
    this.menu = new Controller.ButtonInput();


    // function which calls the getInput method based on the key_code of key which was pressed
    this.keyDownUp  = function(type,key_code) {

        var down = (type == "keydown")  ? true:false;

        switch(key_code) {

            case 68: this.right.getInput(down); break; //d
            case 65: this.left.getInput(down); break;  //a
            case 87: this.up.getInput(down); break;    //w
            case 32: this.up.getInput(down); break;    //space
            
            case 27: this.menu.getInput(down); break;   //escape key
            
            case 37: this.left.getInput(down); break;  //left arrow key
            case 38: this.up.getInput(down); break;    //up arrow key
            case 39: this.right.getInput(down);        //right arrow key
        }
    };
};

Controller.prototype = {

    constructor : Controller

};

Controller.ButtonInput = function() {

    //variable to check whether the Button is pressed or not

    this.active = this.down = false;

};

    Controller.ButtonInput.prototype = {

    

        constructor : Controller.ButtonInput,

        // sets the aktive variable to down, if it's not already the case

        getInput : function(down) {

            if(this.down != down) this.active = down;
            this.down = down;

        }
    };
