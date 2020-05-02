define(['./State.js', './WebGLFont.js', './MeshManagerService.js', './FormFactory.js'],
  function (State, WebGLFont, MeshManager, FormFactory) {

    class Fassade {

      meshManager
      observer

      selected_object
      selected_object_color
      selected_mesh

      count = 0
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
        if (intersects.length > 0) {
          if (this.selected_object != intersects[0].object) {
            this.selected_object = intersects[0].object
            this.selected_object_color = intersects[0].object.material.color
          }
          //  intersects[0].object.scale.set(3, 4, 6);
          intersects[0].object.material.color = new THREE.Color(this.selected_object_color.r + .27, this.selected_object_color.g + .27, this.selected_object_color.b + .27)

        } else if (this.selected_object) {
          // this.selected_object.scale.set(2, 3, 5);
          this.selected_object.material.color = this.selected_object_color

        }
      }

      /**
       *function to select a CAD model resulting in only corresponding text object to follow the camera. Selected model gets brighter
       * @param intersects
       */
      focus = function (intersects) {
        let models = this.meshManager.models
        if (intersects.length > 0) {
          for (let model in models) {
            if (intersects[0].object.name == model) {
              if (this.highlight == models[model]) {
                this.highlight.material.color = new THREE.Color(this.selected_object_color.r - .3, this.selected_object_color.g - .3, this.selected_object_color.b - .3)
                this.selected_object_color = this.highlight.material.color
                this.highlight = undefined
              } else {
                this.highlight = models[model]
                this.highlight.material.color = new THREE.Color(this.selected_object_color.r + .3, this.selected_object_color.g + .3, this.selected_object_color.b + .3)
                this.selected_object_color = this.highlight.material.color
              }
            }
          }
        }

      }

      selectMesh (intersects) {
        let picking_objects = this.meshManager.pickingObjects
        if (intersects.length > 0) {
          for (let index in picking_objects) {
            if (intersects[0].object.name == picking_objects[index].name) {
              if (intersects[0].object.name == 'nav_down') {
                this.updateManager.moveDown()
              }
              if (intersects[0].object.name == 'nav_up') {
                this.updateManager.moveUp()
              }
              if (intersects[0].object.name == 'nav_left') {
                this.notifyObserver(State.State_MOVE_LEFT)
         

              }
              if (intersects[0].object.name == 'nav_right') {
                this.notifyObserver(State.State_MOVE_RIGHT)
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

      onChange = function onChange (mesh, val) {

        let fonts = WebGLFont({
          name: mesh.name,
          text: String(val),
          position: new THREE.Vector3(mesh.position.x, mesh.position.y, mesh.position.z,),
          rotation: new THREE.Vector3(mesh.rotation.x, mesh.rotation.y, mesh.rotation.z,),
          scale: new THREE.Vector3(mesh.scale.x, mesh.scale.y, mesh.scale.z,),
          parent: mesh.parent.name,
          listener: mesh.listener //param_ref unter user Data
        })

        this.deleteText(mesh)
        this.addText(fonts)
      }

      deleteText (text) {
        const scene = this.meshManager.scene
        scene.remove(text)
        this.meshManager.deleteText(text)
      }

      addText (text) {
        this.meshManager.text = text.textAnchor
        const scene = this.meshManager.scene
        scene.add(text.textAnchor)
        if (this.meshManager.getModel(text['parent'])) {
          text.textAnchor.parent = this.meshManager.getModel(text.parent)
        }
      }
    }

    return Fassade
  }
)
