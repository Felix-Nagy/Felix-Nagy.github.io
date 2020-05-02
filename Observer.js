define(["./Fassade.js", "./SceneBuilder.js", "./State.js", "./MeshManagerService.js", "./animations.js", "./updateManager.js",'./controller.js' ], function (
            Fassade,
  SceneBuilder,
  State,
  MeshManager,
  animations,
  UpdateManager,
  controller
) {
  const THREE = require("./libs/three.min.js");

  class Observer{
   container;
   camera;
   renderer;
   scene;
   raycaster = new THREE.Raycaster();
   mouse = new THREE.Vector2(0,0);
   orbitControls;
   mousedown = false;
   controlKey = false;
   models = [];
   text;
   intersect_meshes;

   updateManager;
   fassade;
   meshManager;

   order = [];

   intersect_videos = []

   onMouseDown;
   onMouseUp;
   onMouseMove;
   in_clearPickPosition;
   out_clearPickPosition;
   onKeyDown;
   onKeyUp

   ontouchstart
   ontouchend
   ontouchmove

   gallery
   reactApp
   game


  async update (state) {
    switch (state) {
      case State.State_INITIAL:
            this.init();
            break;
    case State.State_LOADED:
       this.addEventControls();
            break;
      case State.State_MOVE_DOWN:
        this.updateManager.moveDown()
            break;

      case State.State_MOVE_UP:
  this.updateManager.moveUp()
            break;

   case State.State_MOVE_LEFT:
  this.removeEventControls()
   document.getElementById(this.order[1]).pause();
      this.updateManager.moveLeft(this.order)
    this.decideOrderLeft()
   document.getElementById(this.order[1]).play();
   setTimeout(()=> {
   this.addEventControls()
   }, 2000)

    break;

  case State.State_MOVE_RIGHT:
  this.removeEventControls()
   document.getElementById(this.order[1]).pause();

    this.updateManager.moveRight(this.order)
       this.decideOrderRight()
   document.getElementById(this.order[1]).play();
   setTimeout( ()=> {
   this.addEventControls()
   },2000)
    break;
    }
  };

    async init() {
    let sceneBuilder = new SceneBuilder.SceneBuilder()
    await sceneBuilder.init();
    this.container = sceneBuilder.container;
    this.camera = sceneBuilder.camera;
    this.transformControls = sceneBuilder.transformControls;
    this.orbitControls = sceneBuilder.orbitControls;
    this.renderer = sceneBuilder.renderer;
    this.meshManager = sceneBuilder.meshManager;
    this.scene = this.meshManager.scene
    State.highlight = this.meshManager.getVideo('gallery')
    //State.order.push(this.meshManager.getVideo('reactApp'),this.meshManager.getVideo('gallery'),this.meshManager.getVideo('game'))
    this.updateManager = new UpdateManager(this.fassade, this.meshManager, sceneBuilder.onPhone);
      this.fassade = new Fassade(this.meshManager, this, this.updateManager)
    this.updateManager.init();
    let videos = this.meshManager.getVideos()
    for(let i in videos) {
        this.intersect_videos.push(videos[i])
    }

  /* this.gallery = await this.scene.getObjectByName('gallery')
   this.game =  await this.scene.getObjectByName('game')
   this.reactApp = await this.scene.getObjectByName('reatApp')*/
   this.gallery = this.meshManager.getVideo('gallery')
   this.game = this.meshManager.getVideo('game')
   this.reactApp = this.meshManager.getVideo('reactApp')
    this.order.push('reactApp')
    this.order.push('gallery')
    this.order.push('game')

    this.renderer.setAnimationLoop(() => {
      this.updateManager.update();
      this.render();
    });


    window.addEventListener("resize", () =>{
      this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        });
    this.update(State.State_LOADED);
    this.updateManager.running = true;
  }

   addEventControls() {
    window.addEventListener("mousedown", this.onMouseDown = (event) => {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        let intersects = this.raycaster.intersectObjects(this.meshManager.pickingObjects);
          this.fassade.selectMesh(intersects);
          intersects = this.raycaster.intersectObjects(this.intersect_videos);
          this.fassade.open(intersects);


        })

    window.addEventListener("mouseup", this.onMouseUp = () => {
     this.mousedown = false;
    })

    window.addEventListener("touchstart", this.ontouchstart =  (event) => {
    this.mouse.x = +(event.targetTouches[0].pageX / window.innerWidth) * 2 +-1;
    this.mouse.y = -(event.targetTouches[0].pageY / window.innerHeight) * 2 + 1;
     this.raycaster.setFromCamera(this.mouse, this.camera);
            let intersects = this.raycaster.intersectObjects(this.meshManager.pickingObjects);
            this.fassade.onMouseMove(intersects);
            this.fassade.selectMesh(intersects);
            intersects = this.raycaster.intersectObjects(this.intersect_videos);
            this.fassade.open(intersects);


    })

       window.addEventListener("touchmove", this.ontouchmove = (event) => {
        this.mouse.x = +(event.targetTouches[0].pageX / window.innerWidth) * 2 +-1;
        this.mouse.y = -(event.targetTouches[0].pageY / window.innerHeight) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);
            let intersects = this.raycaster.intersectObjects(this.meshManager.pickingObjects);
            this.fassade.onMouseMove(intersects);
    })

      window.addEventListener("touchend", this.ontouchend = (event) => {
            this.mouse.x = -10000000
            this.mouse.y = -10000000
             let intersects = this.raycaster.intersectObjects(this.meshManager.pickingObjects);
                        this.fassade.onMouseMove(intersects);

        })


    window.addEventListener("mousemove", this.onMouseMove = () => {
     this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        let intersects = this.raycaster.intersectObjects(this.meshManager.pickingObjects, true);
        this.fassade.onMouseMove(intersects);

      //  intersects = this.raycaster.intersectObjects(this.intersect_videos, true);
      //  this.fassade.onMouseMove(intersects);
            })

    window.addEventListener("mouseout", this.in_clearPickPosition = () => {
        this.mouse.x = -100000;
        this.mouse.y = -100000;
    })

    window.addEventListener("mouseleave", this.out_clearPickPosition = () => {
          this.mouse.x = -100000;
            this.mouse.y = -100000;
        })

  }

   removeEventControls() {
    window.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mouseout", this.in_clearPickPosition);
    window.removeEventListener("mouseleave", this.out_clearPickPosition);
    window.removeEventListener("touchstart", this.ontouchstart);
    window.removeEventListener("touchend", this.ontouchend);
    window.removeEventListener("touchmove", this.ontouchmove);
  }

   render() {
    this.renderer.render(this.scene, this.camera);
  }

// checking for various control combinations when selecting an object

      decideOrderRight() {
        let newOrder = []
        newOrder[0] = this.order[2]
        newOrder[1] =  this.order[0]
        newOrder[2] =  this.order[1]
        this.order = newOrder

      }

      decideOrderLeft() {
        let newOrder = []
        newOrder[0] = this.order[1]
        newOrder[1] = this.order[2]
        newOrder[2] =  this.order[0]
        this.order = newOrder
      }
  }


  return Observer;
});
