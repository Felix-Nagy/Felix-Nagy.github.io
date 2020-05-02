define(['./animations.js', './MeshManagerService.js', './Fassade.js', './libs/three.min.js', './ModelLoader.js','./State.js'], function (animations,
  MeshManager, Fassade, THREE, ModelLoaderState, State) {

  class UpdateManager {
    clock = new THREE.Clock()
    mixers = []
    save = true
    running = true
    animation
    fassade
    meshManager
    onPhone

    constructor (fassade, meshManager, onPhone) {
      this.fassade = fassade
      this.meshManager = meshManager
      this.onPhone = onPhone
    }

    init () {
      let mesh = this.meshManager.getText('IntroductionGroup')
      this.animation = new animations.Animation(this.meshManager, this.onPhone)
      this.animation.moveIn(mesh)
      this.animation.wobble(mesh)
      const scene = this.meshManager.scene
      scene.add(mesh)
      this.mixers.push(mesh.userData.mixer)
      let nav_down = this.meshManager.getPickingObject('nav_down')
      this.animation.nav_moveIn(nav_down)
      this.mixers.push(nav_down.userData.mixer)

     /* let gallery = this.animation.wobble(this.meshManager.getVideo('gallery'))
      let game = this.animation.wobble(this.meshManager.getVideo('game'))
      let reactApp = this.animation.wobble(this.meshManager.getVideo('reactApp'))
      this.mixers.push(gallery.userData.mixer2)
      this.mixers.push(game.userData.mixer2)
      this.mixers.push(reactApp.userData.mixer2)*/

      let git = this.animation.wobble(this.meshManager.getVideo('git'))
      let mail = this.animation.wobble(this.meshManager.getVideo('mail'))
      let phone = this.animation.wobble(this.meshManager.getVideo('phone'))
      this.mixers.push(phone.userData.mixer2)
      this.mixers.push(git.userData.mixer2)
      this.mixers.push(mail.userData.mixer2)
    }

    update () {
      const Observer = require('./Observer.js')
      const camera = this.meshManager.camera
      const texts = this.meshManager.texts
      if (this.running) {
        const delta = this.clock.getDelta()
        for (const mixer of this.mixers) {
          mixer.update(delta)
        }

      }
    }

    moveDown () {
      const camera = this.animation.moveCameraDown()
      camera.userData.mixer._actions[0].play()
      this.mixers.push(camera.userData.mixer)
      camera.userData.mixer._actions[0].play()
    }

    moveUp () {
      const camera = this.animation.moveCameraUp()
      camera.userData.mixer._actions[0].play()
      this.mixers.push(camera.userData.mixer)
      camera.userData.mixer._actions[0].play()
    }

    decideOrderRight() {
      let newOrder = []
      newOrder[0] = State.order[2]
      newOrder[1] =  State.order[0]
      newOrder[2] =  State.order[1]
      State.order = newOrder
      return newOrder[1]
    }

    decideOrderLeft() {
      let newOrder = []
      newOrder[0] = State.order[1]
      newOrder[1] =  State.order[2]
      newOrder[2] =  State.order[0]
      State.order = newOrder
      return newOrder[1]
    }


    moveLeft (order) {
      let left = this.meshManager.getVideo(order[0])
      let mid = this.meshManager.getVideo(order[1])
      let right = this.meshManager.getVideo(order[2])

      this.animation.shuffleLeft(left, mid, right)

/*
      this.meshManager.video = gallery
      this.meshManager.video = reactApp
      this.meshManager.video = game
*/

      this.mixers.push(left.userData.mixer)
      this.mixers.push(mid.userData.mixer)
      this.mixers.push(right.userData.mixer)

    }

    moveRight (order) {
      let left = this.meshManager.getVideo(order[0])
      let mid = this.meshManager.getVideo(order[1])
      let right = this.meshManager.getVideo(order[2])

      this.animation.shuffleRight(left, mid, right)

      /*
            this.meshManager.video = gallery
            this.meshManager.video = reactApp
            this.meshManager.video = game
      */

      this.mixers.push(left.userData.mixer)
      this.mixers.push(mid.userData.mixer)
      this.mixers.push(right.userData.mixer)
    }

    /**
     * Function to call on a boolean paramater onChange Method
     * @param parameter
     */
    stopAnimation (parameter) {
      if (!paramter.value) {
        const meshes = animations.getModels()
        for (let name in meshes) {
          if (paramter.name == meshes[name]) {
            meshes[name].userData.mixer._actions[0].stop()

          }
        }
      }

    }

    checkCameraDistance (mesh, camera) {
      return Math.abs(mesh.position.x - camera.position.x) + Math.abs(mesh.position.y - camera.position.y) + Math.abs(mesh.position.z - camera.position.z) < 600
    }
  }

  return UpdateManager
})
