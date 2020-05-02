define(function () {


    /*
    State_INITIAL       = State to setup the THREE Scene. Used to start the application and signal the SceneBuilder to load the current configuration from a File.

    State_LOADED        = After having been initialised and all of the assets are loaded, namely MSDF Font Files and the gltf Model the app changes into State loaded.
                            So that all objects that depend on the assets to be loaded are defined and can be accessed. All basic Controls are added in this state.

    State_INPUT_FIELD   = State when the user clicked on a certain text field and the input field gets displayed. All Event Listeners for user Input in the Observer get removed, to prevent
                            the user from selecting a different object when clicking on the canvas. Submitting changes results in saving the Scene and returning to the LOADED State.

    State_MOVE_MESH     = App changes into MOVE_MESH whenever the user selects a object that can be moved or creates a new object. Now only the controls to move a Object are available.
                            To leave the state -> document gets the enter key event and saves the current scene setup while changing back to LOADED
                            or to the escape key down event reverting the movement and changing to LOADED

    State_CREATE_MESH   = When pressing control + right click during the LOADED State a new form gets displayed and Controls in the Observer are disabled. Submitting or canceling the form changes
                            the state back to LOADED.
    */

    const State = {
        State_INITIAL: 1,
        State_MOVE_DOWN: 2,
        State_MOVE_UP: 3,
        State_MOVE_LEFT: 4,
        State_MOVE_RIGHT: 5,
    };

    State.order = [];

    State.highlight;

    return State;
});
