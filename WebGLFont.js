define(function (require) {
    // MSDF Font generator
    // https://msdf-bmfont.donmccurdy.com/
    const THREE = require("./libs/three.min.js");
    const createGeometry = require("./libs/bmfonttext.js");
    const MSDFShader = require("./libs/three-bmfont-text/shaders/msdf.js");

    const fileName = "./fonts/SourceSansPro-Regular";
    const jsonPath = fileName + ".json";
    const imagePath = fileName + ".png";

    let font_json;
    let font_img;

    // Loading the JSON and Image File of the MSDF font

    function loadJson() {
        let file_loader = new THREE.FileLoader();
        file_loader.load(jsonPath,
            function (data) {
                font_json = JSON.parse(data);
                loadImg();
            })
    }

    function loadImg() {
        let textureLoader = new THREE.TextureLoader();
        textureLoader.load(imagePath, function (texture) {
            font_img = texture;
        })
    }

    loadJson();

    /**
     * Central Interface to create a 3D Object of a given Text. Also provides a background field to increase visibility and the hitbox of the text.
     * @param opt:FONTOPT
     * @returns {{helper: THREE.Mesh, fontmesh: THREE.Mesh}}
     * @constructor
     */
    var WebGLFont = function (opt = FONTOPT) {

        let parent = opt.parent;

        let geometry = createGeometry.createTextGeometry({
            text: opt.text,
            width: 1000 | opt.width,            //word wrapped to 1000px
            align: 'left',          //left text alignment
            flipY: font_img.flipY,
            font: font_json,
            lineHeight: font_json.common.lineHeight | opt.lineHeight
        });


        let material = new THREE.RawShaderMaterial(MSDFShader.createMSDFShader({
            map: font_img,
            transparent: true,
            side: THREE.DoubleSide, // sides to render
            color: 0xffffff
        }));

        let fontmesh = new THREE.Mesh(geometry, material);
        fontmesh.scale.set(0.1, 0.1, 0.1);

        // rotation font to the direction facing the camera
        fontmesh.rotation.x = Math.PI;

        fontmesh.name = opt.name;

        // background object to increase hitbox of the text

        // Group object to deal with transformations of both helper and text
        let textAnchor = new THREE.Object3D();
        textAnchor.add(fontmesh);

        textAnchor.name = fontmesh.name;
        textAnchor.listener = opt.listener;

        textAnchor.position.set(opt.position.x, opt.position.y, opt.position.z);
        textAnchor.rotation.set(opt.rotation.x, opt.rotation.y, opt.rotation.z);
        textAnchor.scale.set(opt.scale.x, opt.scale.y, opt.scale.z);

        return {textAnchor, parent}

    }

    function hashCode(str) {
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash;
    }

    function intToRGB(i){
        var c = (i & 0x00FFFFFF)
          .toString(16)
          .toUpperCase();

        return "00000".substring(0, 6 - c.length) + c;
    }

    return WebGLFont;
})

