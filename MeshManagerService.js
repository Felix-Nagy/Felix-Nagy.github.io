define([], function () {

    class MeshManager {

        constructor() {
        }

        _picking_objects = [];
        _texts = {};
        _models = {};
        _videos = {}
        _scene = {}
        _controls;
        _camera;
        highlight

        set video(mesh) {
            this._videos[mesh.name] = mesh
        }
        getVideos() {
            return this._videos
        }

        getVideo = function (name) {
            if (this._videos[name]) {
                return this._videos[name];
            } else return undefined;
        };

        get camera(){
            return this._camera
        }

        set camera(camera) {
            this._camera = camera
        }

        get controls() {
            return this._controls
        }

        set controls(controls) {
            this._controls = controls
        }

        set pickingObject(mesh) {
            this._picking_objects.push(mesh);
        };
        get pickingObjects  () {
            return this._picking_objects
        };

        getPickingObject = function (name) {
            for (let i in this._picking_objects) {
                if (this._picking_objects[i].name == name) {
                    return this._picking_objects[i];
                } else return;
            }
        };

        deletePickingObject = function (mesh) {
            let index = this._picking_objects.indexOf(mesh);
            if (index > -1) {
                this._picking_objects.splice(index, 1);
            }
        };

        set model(mesh) {
            this._models[mesh.name] = mesh
        };

        getModel = function (name) {
            if (this._models[name]) {
                return this._models[name];
            } else return undefined;
        };
        get models () {
            return this._models;
        };

        deleteModel = function (mesh) {
            delete this._models[mesh.name];
        };

        set text (mesh) {
            this._texts[mesh.name] = mesh
        };

        getText = function (name) {
            if (this._texts[name]) {
                return this._texts[name];
            }
        };
        get texts() {
            return this._texts;
        };

        deleteText = function (mesh) {
            delete this._texts[mesh.name];
        };

        get scene () {
            return this._scene
        }
        set scene (newScene) {
            this._scene = newScene
        }
    }

    return MeshManager;
});
