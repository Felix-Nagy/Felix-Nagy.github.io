define(['./State.js', './WebGLFont.js', './MeshManagerService.js', ],
  function (State, WebGLFont, MeshManager) {

    class Fassade {

      meshManager
      observer

      selected_object
      selected_object_color
      selected_mesh


      selected_object2
      selected_object_color2

      updateManager

      constructor (meshManager, observer, updateManager) {
        this.meshManager = meshManager
        this.observer = observer
        this.updateManager = updateManager
      }

      notifyObserver = async function (state) {
        this.observer.update(state)
      }

      /**
       * loops through the text and models array and creates a json object storing all changes made to the scene
       */

      onMouseMove = function (intersects) {


         if (this.selected_object) {
            this.selected_object.material.color = this.selected_object_color
           this.selected_object = undefined;
          }
        if (intersects.length > 0) {
            this.selected_object = intersects[0].object
            this.selected_object_color = intersects[0].object.material.color
           this.selected_object.material.color = new THREE.Color(this.selected_object_color.r + .3, this.selected_object_color.g + .3, this.selected_object_color.b + .3)

        }



      }


      selectMesh (intersects) {
        let picking_objects = this.meshManager.pickingObjects
        if (intersects.length > 0) {
          for (let index in picking_objects) {
            if (intersects[0].object.name == picking_objects[index].name) {
              if (intersects[0].object.name == 'nav_down') {
                this.updateManager.moveDown()
                document.getElementById(this.observer.order[1]).play();
              }
              if (intersects[0].object.name == 'nav_up') {
                this.updateManager.moveUp()
              }
              if (intersects[0].object.name == 'nav_left') {
                this.notifyObserver(State.State_MOVE_RIGHT)
         

              }
              if (intersects[0].object.name == 'nav_right') {
                this.notifyObserver(State.State_MOVE_LEFT)
              }
              if (intersects[0].object.name == 'play') {
                document.getElementById(this.observer.order[1]).play();
              }
              if (intersects[0].object.name == 'stop') {
                document.getElementById(this.observer.order[1]).pause();
              }
            }
          }
        }
      }

      open (intersects) {
        if (intersects.length > 0) {
          if (intersects[0].object.name == 'game') {
            window.open('/portfolio_old/index.html')
          }
          if (intersects[0].object.name == 'gallery') {
            window.open('https://gallerywebappclient.web.app/gallery')
          }
          if (intersects[0].object.name == 'reactApp') {
            window.open('https://github.com/Felix-Nagy/CustomerManager')
          }
          if (intersects[0].object.name == 'git') {
            window.open('https://github.com/Felix-Nagy/')
          }
          if (intersects[0].object.name == 'mail') {
            window.location.href = "mailto:felix.nagy15@gmail.com?subject=Subject&body=message%20goes%20here";
          }
          if (intersects[0].object.name == 'phone') {
            window.open("tel:+015234155599");
          }

        }
      }

    }

    return Fassade
  }
)
