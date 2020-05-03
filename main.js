define(["./Fassade.js", "./Observer.js", './SceneBuilder.js'], function (Fassade, Observer, SceneBuilder) {


    const State = require("./State.js");


    async function loading() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve()
            }, 350)
        });

    }

    loading().then(() => {
        const observer = new Observer()
        observer.update(State.State_INITIAL);

    })

});

/*
drag-data-point js
container.js 301
this.d_fetched = new Deferred()
promise => resolve, reject
class F0o{
    constructor () {
    }
    async init()
    }
    foo = new Foo()
 */



