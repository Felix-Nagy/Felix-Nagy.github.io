define(['./ModelLoader.js', './libs/three.min.js'], function (ModelLoader, THREE) {

  ANIMATIONOPT = {
    target: new THREE.Mesh,
    radius: Number,
    parameter: String
  }

  class Animation {
    meshManager
    models
    onPhone

    constructor (meshManager, onPhone) {
      this.models = {}
      this.onPhone = onPhone
      this.meshManager = meshManager
    }

    moveIn (mesh) {
      mesh.userData.mixer = new THREE.AnimationMixer(mesh)
      let pos = new THREE.VectorKeyframeTrack(
        '.position',
        [0, 1, 2],
        [
          -100, 0, -100,
          -50, 0, -50,
          0, 0, 0
        ]
      )
      let rot = new THREE.VectorKeyframeTrack(
        '.rotation[y]',
        [0, 1, 2],
        [
          Math.PI / 2,
          Math.PI / 4,
          0,
        ]
      )
      const animationClip = new THREE.AnimationClip(null, 2, [pos, rot])
      const animationAction = mesh.userData.mixer.clipAction(animationClip)
      animationAction.play()
      animationAction.timeScale = 2
      animationAction.setLoop(THREE.LoopOnce)
      this.models[mesh.name] = mesh
      return mesh
    }

    nav_moveIn (mesh) {
      mesh.userData.mixer = new THREE.AnimationMixer(mesh)
      let pos = new THREE.VectorKeyframeTrack(
        '.position',
        [0, 1, 3],
        [
          0, -200, 100,
          0, -150, 50,
          mesh.position.x, mesh.position.y, mesh.position.z
        ]
      )
      const animationClip = new THREE.AnimationClip(null, 3, [pos])
      const animationAction = mesh.userData.mixer.clipAction(animationClip)
      animationAction.play()
      animationAction.timeScale = 1.7
      animationAction.setLoop(THREE.LoopOnce)
      this.models[mesh.name] = mesh
      return mesh
    }

    shuffleRight (left, mid, right) {
      left.position.set(-120, -200, -20.1)
      mid.position.set(120, -200, -20.1,)
      right.position.set(0, -190, 30)

      left.rotation.y = -Math.PI / 14,
        mid.rotation.y = Math.PI / 14
      right.rotation.y = 0

      left.userData.mixer = new THREE.AnimationMixer(left)
      let posL = new THREE.VectorKeyframeTrack(
        '.position',
        [0, 1],
        [
          120, -200, -20.1,
          -120, -200, -20.1
        ]
      )
      let rotL = new THREE.VectorKeyframeTrack(
        '.rotation[y]',
        [0, 1,],
        [
          Math.PI / 14,
          -Math.PI / 14,
        ]
      )
      const animationClipL = new THREE.AnimationClip(null, 1, [posL, rotL])
      const animationActionL = left.userData.mixer.clipAction(animationClipL)
      animationActionL.setLoop(THREE.LoopOnce)
      animationActionL.timeScale = 5
      animationActionL.play()

      right.userData.mixer = new THREE.AnimationMixer(right)
      let posR = new THREE.VectorKeyframeTrack(
        '.position',
        [0, 1],
        [
          -120, -200, -20.1,
          0, -190, 30
        ]
      )
      let rotR = new THREE.VectorKeyframeTrack(
        '.rotation[y]',
        [0, 1,],
        [
          -Math.PI / 14,
          0
        ]
      )
      const animationClipR = new THREE.AnimationClip(null, 1, [posR, rotR])
      const animationActionR = right.userData.mixer.clipAction(animationClipR)
      animationActionR.setLoop(THREE.LoopOnce)
      animationActionR.timeScale = 5
      animationActionR.play()

      mid.userData.mixer = new THREE.AnimationMixer(mid)
      let posM = new THREE.VectorKeyframeTrack(
        '.position',
        [0, 1],
        [
          0, -190, 30,
          120, -200, -20.1,
        ]
      )
      let rotM = new THREE.VectorKeyframeTrack(
        '.rotation[y]',
        [0, 1,],
        [
          0,
          Math.PI / 14,
        ]
      )
      const animationClipM = new THREE.AnimationClip(null, 1, [posM, rotM])
      const animationActionM = mid.userData.mixer.clipAction(animationClipM)
      animationActionM.setLoop(THREE.LoopOnce)
      animationActionM.timeScale = 5
      animationActionM.play()
    }

    shuffleLeft (left, mid, right) {

      mid.position.set(-120, -200, -20.1)
      left.position.set(120, -200, -20.1,)
      right.position.set(0, -190, 30)

      mid.rotation.y = -Math.PI / 14
      left.rotation.y = Math.PI / 14
      right.rotation.y = 0

      left.userData.mixer = new THREE.AnimationMixer(left)
      let posL = new THREE.VectorKeyframeTrack(
        '.position',
        [0, 1],
        [
          -120, -200, -20.1,
          120, -200, -20.1
        ]
      )
      let rotL = new THREE.VectorKeyframeTrack(
        '.rotation[y]',
        [0, 1,],
        [
          -Math.PI / 14,
          Math.PI / 14,
        ]
      )
      const animationClipL = new THREE.AnimationClip(null, 1, [posL, rotL])
      const animationActionL = left.userData.mixer.clipAction(animationClipL)
      animationActionL.setLoop(THREE.LoopOnce)
      animationActionL.play()

      right.userData.mixer = new THREE.AnimationMixer(right)
      let posR = new THREE.VectorKeyframeTrack(
        '.position',
        [0, 1],
        [
          120, -200, -20.1,
          0, -190, 30
        ]
      )
      let rotR = new THREE.VectorKeyframeTrack(
        '.rotation[y]',
        [0, 1,],
        [
          Math.PI / 14,
          0
        ]
      )
      const animationClipR = new THREE.AnimationClip(null, 1, [posR, rotR])
      const animationActionR = right.userData.mixer.clipAction(animationClipR)
      animationActionR.setLoop(THREE.LoopOnce)
      animationActionR.play()

      mid.userData.mixer = new THREE.AnimationMixer(mid)
      let posM = new THREE.VectorKeyframeTrack(
        '.position',
        [0, 1],
        [
          0, -190, 30,
          -120, -200, -20.1,
        ]
      )
      let rotM = new THREE.VectorKeyframeTrack(
        '.rotation[y]',
        [0, 1,],
        [
          0,
          -Math.PI / 14,
        ]
      )
      const animationClipM = new THREE.AnimationClip(null, 1, [posM, rotM])
      const animationActionM = mid.userData.mixer.clipAction(animationClipM)
      animationActionM.setLoop(THREE.LoopOnce)
      animationActionM.play()

    }

    shuffleRight (left, mid, right) {

      left.position.set(0, -190, 30)
      right.position.set(-120, -200, -20.1)
      mid.position.set(120, -200, -20.1,)

      right.rotation.y = -Math.PI / 14
      mid.rotation.y = Math.PI / 14
      left.rotation.y = 0

      left.userData.mixer = new THREE.AnimationMixer(left)
      let posL = new THREE.VectorKeyframeTrack(
        '.position',
        [0, 1],
        [
          -120, -200, -20.1,
          -0, -190, 30
        ]
      )
      let rotL = new THREE.VectorKeyframeTrack(
        '.rotation[y]',
        [0, 1,],
        [
          -Math.PI / 14,
          0
        ]
      )
      const animationClipL = new THREE.AnimationClip(null, 3, [posL, rotL])
      const animationActionL = left.userData.mixer.clipAction(animationClipL)
      animationActionL.setLoop(THREE.LoopOnce)
      animationActionL.play()

      right.userData.mixer = new THREE.AnimationMixer(right)
      let posR = new THREE.VectorKeyframeTrack(
        '.position',
        [0, 1],
        [
          120, -200, -20.1,
          -120, -200, -20.1,
        ]
      )
      let rotR = new THREE.VectorKeyframeTrack(
        '.rotation[y]',
        [0, 1,],
        [
          Math.PI / 14,
          -Math.PI / 14,

        ]
      )
      const animationClipR = new THREE.AnimationClip(null, 3, [posR, rotR])
      const animationActionR = right.userData.mixer.clipAction(animationClipR)
      animationActionR.setLoop(THREE.LoopOnce)
      animationActionR.play()

      mid.userData.mixer = new THREE.AnimationMixer(mid)
      let posM = new THREE.VectorKeyframeTrack(
        '.position',
        [0, 1],
        [
          0, -190, 30,
          120, -200, -20.1,
        ]
      )
      let rotM = new THREE.VectorKeyframeTrack(
        '.rotation[y]',
        [0, 1,],
        [
          0,
          Math.PI / 14,
        ]
      )
      const animationClipM = new THREE.AnimationClip(null, 3, [posM, rotM])
      const animationActionM = mid.userData.mixer.clipAction(animationClipM)
      animationActionM.setLoop(THREE.LoopOnce)
      animationActionM.play()
    }

    wobble (mesh) {
      mesh.userData.mixer2 = new THREE.AnimationMixer(mesh)
      let rot = new THREE.VectorKeyframeTrack(
        '.rotation[y]',
        [0, 1,],
        [
          0,
          2*Math.PI,
        ]
      )
      let rotx = new THREE.VectorKeyframeTrack(
        '.rotation[z]',
        [0, 1,1,2],
        [
          0,
          Math.PI,
          0,
          -Math.PI,
        ]
      )
      const animationClip = new THREE.AnimationClip(null, 1, [rot ])
      const animationAction = mesh.userData.mixer2.clipAction(animationClip)
      animationAction.setLoop(THREE.LoopRepeat)
      animationAction.timeScale = .05
      animationAction.play()
      return mesh
    }

    moveCameraDown () {
      const camera = this.meshManager.camera
      camera.userData.mixer = new THREE.AnimationMixer(camera)
      camera.position.y = -200
      let pos = new THREE.VectorKeyframeTrack(
        '.position',
        [0, 1],
        [
          camera.position.x, 1.5, camera.position.z,
          camera.position.x, -200, camera.position.z

        ]
      )
      const animationClip = new THREE.AnimationClip(null, 2, [pos])
      const animationAction = camera.userData.mixer.clipAction(animationClip)
      animationAction.timeScale = 1
      animationAction.setLoop(THREE.LoopOnce)

      return camera
    }

    moveCameraUp () {
      const camera = this.meshManager.camera
      camera.userData.mixer = new THREE.AnimationMixer(camera)
      camera.position.y = -400
      let pos = new THREE.VectorKeyframeTrack(
        '.position',
        [0, 1],
        [
          camera.position.x, -200, camera.position.z,
          camera.position.x, -400, camera.position.z

        ]
      )
      const animationClip = new THREE.AnimationClip(null, 2, [pos])
      const animationAction = camera.userData.mixer.clipAction(animationClip)
      animationAction.timeScale = 1
      animationAction.setLoop(THREE.LoopOnce)

      return camera
    }

    arrow = function (center, radius, parameter) {
      const mesh = ModelLoader.getAnimation({
        name: 'arrow',
        position: new THREE.Vector3(center.position.x - radius, center.position.y, center.position.z),
        rotation: new THREE.Vector3(0, 0, Math.PI),
        scale: new THREE.Vector3(1, 1, 1)
      })

      mesh.userData.mixer = new THREE.AnimationMixer(mesh)
      let pos = new THREE.VectorKeyframeTrack(
        '.position',
        [0, 1, 2, 3, 4],
        [
          mesh.position.x,
          mesh.position.y,
          mesh.position.z,

          mesh.position.x + radius,
          mesh.position.y + radius,
          mesh.position.z,

          mesh.position.x + 2 * radius,
          mesh.position.y,
          mesh.position.z,

          mesh.position.x + radius,
          mesh.position.y - radius,
          mesh.position.z,

          mesh.position.x,
          mesh.position.y,
          mesh.position.z,

        ], THREE.InterpolateSmooth
      )
      let rot = new THREE.VectorKeyframeTrack(
        '.rotation[z]',
        [0, 1, 2, 3, 4],
        [
          0,
          -Math.PI / 2,
          -Math.PI,
          -Math.PI - Math.PI / 2,
          -2 * Math.PI,
        ]
      )
      const animationClip = new THREE.AnimationClip(null, 4, [pos, rot])
      const animationAction = mesh.userData.mixer.clipAction(animationClip)
      animationAction.play()
      animationAction.timeScale = 2
      mesh.listener = parameter
      this.models[parameter + '_arrow'] = mesh
      return mesh
    }

    getModel = function (name) {
      return models[name]
    }

    getModels = function () {
      return models
    }
  }

  return { Animation }
})
