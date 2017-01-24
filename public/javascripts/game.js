/**************************************************
** GAME VARIABLES
**************************************************/
var canvas,         // Canvas DOM element
    ctx,            // Canvas rendering context
    keys,           // Keyboard input
    localPlayer,    // Local player
    remotePlayers,  // Remote players
    socket;         // socket.io reference

var path;


/**************************************************
** GAME INITIALIZATION
**************************************************/
function init() {
    // Declare the canvas and rendering context
    canvas = document.getElementById("gameCanvas");

    // Create an empty project and a view for the canvas:
    paper.setup(canvas);

    paper.view.viewSize = new paper.Size(window.innerWidth, window.innerHeight);

    path = new paper.Path.Rectangle({
        point: [75, 75],
        size: [75, 75],
        strokeColor: 'black'
    });

    paper.view.onFrame = function(event) {
        console.log("onFrame (new way!) called");
        // Your animation code goes in here
        // path.rotate(3);

        update();
    }

    // Initialise keyboard controls
    keys = new Keys();

    // Calculate a random start position for the local player
    // The minus 5 (half a player size) stops the player being
    // placed right on the egde of the screen
    var startX = Math.round(Math.random()*(canvas.width-5)),
        startY = Math.round(Math.random()*(canvas.height-5));

    // Initialise the local player
    localPlayer = new Player(startX, startY);
    localPlayer.path = new paper.Path.Circle(new paper.Point(startX, startY), 50);
    localPlayer.path.fillColor = 'black';
    localPlayer.path.selected = true;

    // No remote players to begin with? What about existing players..
    remotePlayers = {};


    // Init the socket
    socket = io.connect("http://" + document.location.hostname + ":8000");

    // Start listening for events
    setEventHandlers();

    paper.view.draw();

};


/**************************************************
** GAME EVENT HANDLERS
**************************************************/
var setEventHandlers = function() {
    // Keyboard
    window.addEventListener("keydown", onKeydown, false);
    window.addEventListener("keyup", onKeyup, false);


    socket.on("connect", onSocketConnected);
    socket.on("disconnect", onSocketDisconnect);
    socket.on("new player", onNewPlayer);
    socket.on("move player", onMovePlayer);
    socket.on("remove player", onRemovePlayer);
};

// Keyboard key down
function onKeydown(e) {
    if (localPlayer) {
        keys.onKeyDown(e);
    };
};

// Keyboard key up
function onKeyup(e) {
    if (localPlayer) {
        keys.onKeyUp(e);
    };
};


/**************************************************
** GAME ANIMATION LOOP
**************************************************/
function animate() {
    update();
};

/**************************************************
** GAME UPDATE
**************************************************/
function update() {
    var updated = localPlayer.update(keys);

    localPlayer.path.setPosition([localPlayer.getX(), localPlayer.getY()])

    if (updated) {
        socket.emit("move player", {x: localPlayer.getX(), y: localPlayer.getY()});
    }
};


function onSocketConnected() {
    console.log("Connected to socket server");

    socket.emit("new player", {x: localPlayer.getX(), y: localPlayer.getY()});
};

function onSocketDisconnect() {
    console.log("Disconnected from socket server");

};


function onNewPlayer(data) {
    // console.log("New player connected: " + data.id);

    var newPlayer = new Player(data.x, data.y);
    newPlayer.id = data.id;

    remotePlayers[newPlayer.id] = newPlayer;
};

function onMovePlayer(data) {
    // console.log("Player moved: " + data.id);

    var movedPlayer = remotePlayers[data.id];

    if (!movedPlayer) {
        // Commenting this out because it's noisy, but this should never happen
        // console.log("Player not found: " + this.id);
        return;
    };

    // We probably trust the server, right?
    movedPlayer.setX(data.x);
    movedPlayer.setY(data.y);
};

function onRemovePlayer(data) {
    var removePlayer = remotePlayers[data.id]

    if (!removePlayer) {
        console.log("Player not found: " + data.id);
        return;
    };

    delete remotePlayers[data.id]
};
