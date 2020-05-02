define(function (require) {
    const THREE = require("./libs/three.min.js");
    const GLTFLoader = require("./libs/GLTFLoader.js");

    const fileName = "./model/test2.gltf";
    const animationsFile = "./model/animations.gltf";
    let scene;
    let modelDict = {};
    let animationsDict = {};
    let animations;
    let ModelLoader = {};

    loadGltf();

    // load a gltf scene and extract all objects to a dictionary with their corresponding names
    function loadGltf() {
        const loader = new THREE.GLTFLoader();
        loader.load(
            fileName,
            function (gltf) {
                scene = gltf.scene;
                for (let index in scene.children) {
                    modelDict[scene.children[index].name] = scene.children[index];

                }
            });
        loader.load(
            animationsFile,
            function (gltf) {
                scene = gltf.scene;
                animations = gltf.animations
                for (let index in scene.children) {
                    animationsDict[scene.children[index].name] = scene.children[index];

                }
            });

    }

    MODELOPT = {
        name: "",
        position: new THREE.Vector3(),
        rotation: new THREE.Vector3(),
        scale: new THREE.Vector3()
    };
    /**
     * Function to get a specific Object from the previously loaded gltf Scene.
     * The name of the object to load corresponds with it's name in Blender.
     * Also sets up the rotation and position to place the object in the scene
     * @param MODELOPT
     * @returns {model: THREE.Mesh}
     * @constructor
     */
     ModelLoader = function (opt = MODELOPT) {
        const model = modelDict[opt.name];

        model.position.set(opt.position.x, opt.position.y, opt.position.z);
        model.rotation.set(opt.rotation.x, opt.rotation.y,opt.rotation.z);
        model.scale.set(opt.scale.x, opt.scale.y, opt.scale.z);
        return model
    };

    ModelLoader.getAnimation = function (opt = MODELOPT) {
        const model = animationsDict[opt.name];
        model.position.set(opt.position.x, opt.position.y, opt.position.z);
        model.rotation.set(opt.rotation.x, opt.rotation.y,opt.rotation.z);
        model.scale.set(opt.scale.x, opt.scale.y, opt.scale.z);
        //const animation = animations[opt.animation]
        return model
    }

    return ModelLoader;
});

