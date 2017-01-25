/**************************************************
** GAME VARIABLES
**************************************************/
var canvas,         // Canvas DOM element
    ctx,            // Canvas rendering context
    keys,           // Keyboard input
    localPlayer,    // Local player
    remotePlayers,  // Remote players
    cells,          // Cells on the map
    socket;         // socket.io reference



/**************************************************
** GAME INITIALIZATION
**************************************************/
function init() {
    // Declare the canvas and rendering context
    canvas = document.getElementById("gameCanvas");

    // Create an empty project and a view for the canvas:
    paper.setup(canvas);

    paper.view.viewSize = new paper.Size(window.innerWidth, window.innerHeight);

    paper.view.onFrame = function(event) {
        update();
    }

    // Calculate a random start position for the local player
    // The minus 5 (half a player size) stops the player being
    // placed right on the egde of the screen
    var startX = Math.round(Math.random()*(paper.view.viewSize.width-5)),
        startY = Math.round(Math.random()*(paper.view.viewSize.height-5));

    // Initialise the local player
    localPlayer   = new Player(startX, startY, 'green');
    remotePlayers = {};
    cells         = {};

    // Init the connection to socket.io
    socket = io.connect("http://" + document.location.hostname + ":8000");

    // Start listening for events
    setEventHandlers();

    paper.view.draw();

};


/**************************************************
** GAME EVENT HANDLERS
**************************************************/
var setEventHandlers = function() {
    socket.on("connect", onSocketConnected);
    socket.on("disconnect", onSocketDisconnect);

    socket.on("new player", onNewPlayer);
    socket.on("move player", onMovePlayer);
    socket.on("remove player", onRemovePlayer);

    socket.on("new cell", onNewCell);

};

/**************************************************
** GAME UPDATE
**************************************************/
function update() {
    var updated = localPlayer.update(keys);

    localPlayer.setPosition(localPlayer.getX(), localPlayer.getY())

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

    var newPlayer = new Player(data.x, data.y, 'black');
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
    movedPlayer.setPosition(data.x, data.y);
};


function onRemovePlayer(data) {
    console.log("supposed to remove player now " + Object.keys(remotePlayers).length);
    var removePlayer = remotePlayers[data.id]

    if (!removePlayer) {
        console.log("Player not found: " + data.id);
        return;
    };

    // Since the following 2 lines are atomic, it would make sense to
    // make an object that does this as one operation
    remotePlayers[data.id].destroy()
    delete remotePlayers[data.id];

    console.log("supposed to remove player now " + Object.keys(remotePlayers).length );
};


function onRemovePlayer(data) {
    console.log("supposed to remove player now " + Object.keys(remotePlayers).length);
    var removePlayer = remotePlayers[data.id]

    if (!removePlayer) {
        console.log("Player not found: " + data.id);
        return;
    };

    // Since the following 2 lines are atomic, it would make sense to
    // make an object that does this as one operation
    remotePlayers[data.id].destroy()
    delete remotePlayers[data.id];

    console.log("supposed to remove player now " + Object.keys(remotePlayers).length );
};


function onNewCell(data) {
    cells[data.id] = createCell(data);
}


function createCell(data) {
    var path = new paper.Path.Circle(new paper.Point(data.x, data.y), data.size);
    path.strokeColor = 'black';

    var text = new paper.PointText({
        point: path.position,
        content: '0',
        justification: 'center',
        fontSize: 15
    });

    return new Cell.Cell(data.id, data.x, data.y, data.size, path);
};


function updateCell(data) {

}
