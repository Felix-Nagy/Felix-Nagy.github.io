define(["./Fassade.js", "./WebGLFont.js", "./libs/OrbitControls.js", "./ModelLoader.js", "./libs/TransformControls.js", "./MeshManagerService.js", "./libs/three.min.js"],
    function (Fassade, WebGLFont,
              OrbitControls,
              ModelLoader,
              TransformControls,
              MeshManager, THREE) {

        fetch('./setup/default.json').then((response) => {
            return response.json();
        }).then((data) => {
            setup = data
        });

        class SceneBuilder {
            container;
            camera;
            transformControls;
            orbitControls;
            renderer;
            scene;
            setup;
            onPhone=false
            meshManager;
            observer;

            constructor () {
                if( navigator.userAgent.match(/Android/i)
                  || navigator.userAgent.match(/webOS/i)
                  || navigator.userAgent.match(/iPhone/i)
                  || navigator.userAgent.match(/iPad/i)
                  || navigator.userAgent.match(/iPod/i)
                  || navigator.userAgent.match(/BlackBerry/i)
                ){
                    this.onPhone = true;
                }
            }

            init() {
                this.meshManager = new MeshManager()
                this.setup = setup

                this.container = document.querySelector("#scene-container");
                this.scene = new THREE.Scene();
                this.scene.background = new THREE.Color(0x222222);
                this.createCamera();
                //this.createControls();
                this.createLights();
                this.createRenderer();
                //this.createModels();
                this.createFonts();
                this.createSceneObjects();
                this.meshManager.scene = this.scene
                this.meshManager.controls = this.orbitControls
                this.meshManager.camera = this.camera
            }

            createFonts() {
                for (let i in this.setup.Text) {
                    let data = this.setup.Text[i];
                    let font = WebGLFont({
                        name: data.name,
                        text: data.text,
                        position: new THREE.Vector3(data.position[0], data.position[1], data.position[2]),
                        rotation: new THREE.Vector3(data.rotation[0], data.rotation[1], data.rotation[2]),
                        scale: new THREE.Vector3(data.scale[0], data.scale[1], data.scale[2]),
                        parent: data.parent,
                        width: data.width,
                        lineHeight: data.lineHeight,
                        color: data.color
                    });
                    this.scene.add(font["textAnchor"]);
                    if (this.meshManager.getModel(font["parent"])) {
                        font["textAnchor"].parent = this.meshManager.getModel(font["parent"]);
                    }
                    this.meshManager.text = font["textAnchor"];

                }

            }

            createModels() {
                for (let i in this.setup.Model) {
                    let data = this.setup.Model[i];
                    let model = ModelLoader({
                        name: data.name,
                        position: new THREE.Vector3(data.position[0], data.position[1], data.position[2]),
                        rotation: new THREE.Vector3(data.rotation[0], data.rotation[1], data.rotation[2]),
                        scale: new THREE.Vector3(data.scale[0], data.scale[1], data.scale[2])
                    })
                    this.scene.add(model);
                    this.meshManager.model = model;
                }

            }

            createSceneObjects() {



                const textureLoader = new THREE.TextureLoader();
                const textureGit = textureLoader.load('./textures/git.png')
                textureGit.encoding = THREE.sRGBEncoding;
                textureGit.anisotropy = 16;
                const geometryGit = new THREE.BoxGeometry(40, 40, 40);
                const materialGit = new THREE.MeshPhongMaterial({color:  0xffffff, opacity: 1, transparent: true, reflectivity: 0.7, map: textureGit});
                const Git = new THREE.Mesh(geometryGit, materialGit)
                Git.position.set(100, -375, -5.1)
                Git.name = "git"
                this.scene.add(Git)
                this.meshManager.video = Git


                const textureMail = textureLoader.load('./textures/email-logo.png')
                textureGit.encoding = THREE.sRGBEncoding;
                textureGit.anisotropy = 16;
                const geometryMail = new THREE.BoxGeometry(40, 40, 40);
                const materialMail = new THREE.MeshPhongMaterial({color:  0xffffff, opacity: 1, transparent: true, reflectivity: 0.7, map: textureMail});
                const Mail = new THREE.Mesh(geometryMail, materialMail)
                Mail.position.set(0, -375, -5.1)
                Mail.name = "mail"
                this.scene.add(Mail)
                this.meshManager.video = Mail


                const texturePhone = textureLoader.load('./textures/phone.png')
                textureGit.encoding = THREE.sRGBEncoding;
                textureGit.anisotropy = 16;
                const geometryPhone = new THREE.BoxGeometry(40, 40, 40);
                const materialPhone = new THREE.MeshPhongMaterial({color:  0xffffff, opacity: 1, transparent: true, reflectivity: 1, map: texturePhone});
                const Phone = new THREE.Mesh(geometryPhone, materialPhone)
                Phone.position.set(-100, -375, -5.1)
                Phone.name = "phone"
                this.scene.add(Phone)
                this.meshManager.video = Phone


                const texture = textureLoader.load('./textures/ground_texture_flip.png')
                let geometry = new THREE.BoxGeometry(150,80,5);
                let material = new THREE.MeshPhongMaterial({color:  0x005243, opacity: 1, transparent: true, reflectivity: .7, map:texture});
                let background = new THREE.Mesh(geometry, material);
                background.position.set(0,30,-5.1);


                const textAnchor = new THREE.Object3D();
                textAnchor.add(this.meshManager.getText("Introduction"));
                textAnchor.add(this.meshManager.getText("IntroductionHeader"));
                textAnchor.add(this.meshManager.getText("More"));
                textAnchor.add(background);
                textAnchor.name = "IntroductionGroup"
                this.meshManager.text = textAnchor
                this.scene.add(textAnchor)

                const texture_flip = textureLoader.load('./textures/ground_texture.jpg')

                let geometryO = new THREE.BoxGeometry(150,60,5);
                let materialO = new THREE.MeshPhongMaterial({color:   0x005243, opacity: 1, transparent: true, reflectivity: 0.7,  map:texture_flip});
                let backgroundO = new THREE.Mesh(geometryO, materialO);
                backgroundO.position.set(0,-440,-5.1);

                const Outro = new THREE.Object3D();
                Outro.add(this.meshManager.getText("Outro"));
                Outro.add(backgroundO);
                Outro.name = "OutroGroup"
                this.meshManager.text = Outro
                this.scene.add(Outro)

                let scale = 1
                let posZ = 40
                let posY = -240
                let posX = 78
                let posYSide = -220
                let posYp = -220
                if(this.onPhone){
                    posZ =40
                    posY =-250
                    posX =63
                    posYSide = -240
                    scale = 1.8
                    posYp = -230
                }



                let navdown = ModelLoader.getAnimation({
                    name: 'nav_down',
                    position: new THREE.Vector3(0,-50, -5),
                    rotation: new THREE.Vector3(0,Math.PI/2, Math.PI),
                    scale: new THREE.Vector3(2*scale, 3*scale, 5*scale)
                })
                navdown.name = "nav_down"
                navdown.color = new THREE.Color(0xffffff);

                let navup = ModelLoader.getAnimation({
                    name: 'nav_up',
                    position: new THREE.Vector3(0,posY,posZ),
                    rotation: new THREE.Vector3(0,Math.PI/2, Math.PI),
                    scale: new THREE.Vector3(2*scale, 2*scale, 3*scale)
                })

                navup.name = "nav_up"


                let navleft = ModelLoader.getAnimation({
                    name: 'nav_left',
                    position: new THREE.Vector3(-posX,posYSide,posZ),
                    rotation: new THREE.Vector3(0, 0, Math.PI),
                    scale: new THREE.Vector3(2*scale, 3*scale, 5*scale)
                })
                navleft.name = "nav_left"
                navleft.rotation.x = Math.PI/2
                navleft.rotation.z = Math.PI/2

                let navright = ModelLoader.getAnimation({
                    name: 'nav_right',
                    position: new THREE.Vector3(posX,posYSide,posZ),
                    rotation: new THREE.Vector3(0,0, Math.PI),
                    scale: new THREE.Vector3(2*scale, 3*scale, 5*scale)
                })
                navright.rotation.x = Math.PI/2
                navright.rotation.z = -Math.PI/2
                navright.name = "nav_right"

                this.meshManager.pickingObject = navdown
                this.meshManager.pickingObject = navup
                this.meshManager.pickingObject = navleft
                this.meshManager.pickingObject = navright

                this.scene.add(navdown)
                this.scene.add(navup)
                this.scene.add(navleft)
                this.scene.add(navright)


            /*    let play = ModelLoader.getAnimation({
                    name: 'play',
                    position: new THREE.Vector3(-33,posYp,40),
                    rotation: new THREE.Vector3(0,0, Math.PI),
                    scale: new THREE.Vector3(1*scale, 2*scale, 2*scale)
                })
                play.rotation.x = Math.PI/2
                play.rotation.z = -Math.PI/2
                play.name = "play"

                let stop = ModelLoader.getAnimation({
                    name: 'stop',
                    position: new THREE.Vector3(-42,posYp,40),
                    rotation: new THREE.Vector3(0,0, Math.PI),
                    scale: new THREE.Vector3(2*scale, 2*scale, 2*scale)
                })

                stop.name = "stop"

                this.meshManager.pickingObject = play
                this.meshManager.pickingObject = stop

                this.scene.add(play)
                this.scene.add(stop)

*/
                let videoGame = document.getElementById('game')
                var textureGame = new THREE.VideoTexture( videoGame );
                textureGame.minFilter = THREE.LinearFilter;
                textureGame.magFilter = THREE.LinearFilter;
                textureGame.format = THREE.RGBFormat;
                let game_geometry = new THREE.BoxGeometry(100,58,3);
                let game_material = new THREE.MeshPhongMaterial({color:  0xffffff, opacity: 1, transparent: true, reflectivity: 0.7, map:textureGame});
                let game = new THREE.Mesh(game_geometry, game_material);
                game.position.set(120,-200,-20.1);
                game.rotation.set(0,Math.PI/14,0);
                this.scene.add(game)
                game.name = 'game'
                game.video = videoGame
                this.meshManager.video = game


                let videoGallery = document.getElementById('gallery')
                var textureGallery = new THREE.VideoTexture( videoGallery );
                textureGallery.minFilter = THREE.LinearFilter;
                textureGallery.magFilter = THREE.LinearFilter;
                textureGallery.format = THREE.RGBFormat;

                let gallery_geometry = new THREE.BoxGeometry(100,58,3);
                let gallery_material = new THREE.MeshPhongMaterial({color:  0xffffff, opacity: 1, transparent: true, reflectivity: 0.7, map:textureGallery});
                let gallery = new THREE.Mesh(gallery_geometry, gallery_material);
                gallery.position.set(0,-190,30);

                this.scene.add(gallery)
                gallery.name = 'gallery'
                gallery.video = videoGallery
                this.meshManager.video = gallery





                let videoReact = document.getElementById('reactApp')
                var textureReact = new THREE.VideoTexture( videoReact );
                textureReact.minFilter = THREE.LinearFilter;
                textureReact.magFilter = THREE.LinearFilter;
                textureReact.format = THREE.RGBFormat;

                let reactApp_geometry = new THREE.BoxGeometry(100,58,3);
                let reactApp_material =  new THREE.MeshPhongMaterial({color:  0xffffff, opacity: 1, transparent: true, reflectivity: 0.7,map:textureReact});
                let reactApp = new THREE.Mesh(reactApp_geometry,  reactApp_material);
                reactApp.position.set(-120,-200,-20.1);
                reactApp.rotation.set(0,-Math.PI/14,0);
                this.scene.add(reactApp)
                reactApp.name = 'reactApp'
                gallery.video = videoReact
                this.meshManager.video = reactApp


            }


            createCamera() {
                this.camera = new THREE.PerspectiveCamera(
                    75, //field of view
                    this.container.clientWidth / this.container.clientHeight, //aspect ratio
                    0.1,    //near clipping plane
                    1700    // far clipping plane
                );
                if(this.onPhone) {
                    this.camera.position.set(-1.5, 1.5, 120);
                } else {
                    this.camera.position.set(-1.5, 1.5, 105);
                }
            }

            createControls() {
                this.orbitControls = new THREE.OrbitControls(this.camera, this.container);
                this.orbitControls.enableDamping = true;
                this.orbitControls.dampingFactor = 0.25;

                this.transformControls = new THREE.TransformControls(this.camera, this.container);
                this.transformControls.enableDamping = true;
                this.transformControls.dampingFactor = 0.25;
                this.scene.add(this.transformControls)
            }

            createLights() {
              //  const ambientLight = new THREE.HemisphereLight(0xfffbb, 0x080820, 1); //sky Color, ground Color, intensity
                const ambientLight = new THREE.AmbientLight( 0xa4a4a4 ); // soft white light


                const mainLight = new THREE.DirectionalLight(0xffffff, 15);  // light color, intensity
                mainLight.position.set(0, -150, 100);

                const secondLight = new THREE.DirectionalLight(0xffffff, 5);  // light color, intensity
                mainLight.position.set(0, -300, 50);
                this.scene.add(ambientLight, mainLight );
            }


            createRenderer() {
                this.renderer = new THREE.WebGLRenderer({antialias: true});
                this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);

                this.renderer.setPixelRatio(window.devicePixelRatio);

                this.renderer.gammaFactor = 2.2;
                //  renderer.outputEncoding = true;

                this.renderer.physicallyCorrectLights = true;

                this.container.appendChild(this.renderer.domElement);
            }
        }


        return {SceneBuilder};
    });
