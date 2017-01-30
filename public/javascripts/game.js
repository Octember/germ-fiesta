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
    var path = new paper.Path.Circle(new paper.Point(startX, startY), 30);
    path.fillColor = 'green';
    localPlayer   = new Player.Player(startX, startY, path);
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
    socket.on("update cell", onUpdateCell);
};

/**************************************************
** GAME UPDATE
**************************************************/
function update() {
    var updated = moveLocalPlayer(keys);

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

    var path = new paper.Path.Circle(new paper.Point(data.x, data.y), 30);
    path.fillColor = 'black';

    var newPlayer = new Player.Player(data.x, data.y, path);
    newPlayer.id = data.id;

    remotePlayers[newPlayer.id] = newPlayer;
};


function onMovePlayer(data) {
    // console.log("Player moved: " + data.id);x

    var movedPlayer = remotePlayers[data.id];

    if (!movedPlayer) {
        // Commenting this out because it's noisy, but this should never happen
        // console.log("Player not found: " + this.id);
        return;
    };

    // We probably trust the server, right?
    movedPlayer.setPosition(data.x, data.y);
};


function moveLocalPlayer(keys) {
    var newX, newX, prevY, newY;
    prevX = newX = localPlayer.getX();
    prevY = newY = localPlayer.getY();

    // Up key takes priority over down
    if (paper.Key.isDown('up') || paper.Key.isDown('w')) {
        newY -= Player.PLAYER_MOVE_AMOUNT;
    } else if (paper.Key.isDown('down') || paper.Key.isDown('s')) {
        newY += Player.PLAYER_MOVE_AMOUNT;
    };

    // Left key takes priority over right
    if (paper.Key.isDown('left') || paper.Key.isDown('a')) {
        newX -= Player.PLAYER_MOVE_AMOUNT;
    } else if (paper.Key.isDown('right') || paper.Key.isDown('d')) {
        newX += Player.PLAYER_MOVE_AMOUNT;
    };

    // todo: fix diagonal movement bug

    localPlayer.setPosition(newX, newY);

    return prevX != newX || prevY != newY;
}

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
    var cellID = data.id;
    var drawing = new paper.Path.Circle(new paper.Point(data.x, data.y), data.radius);
    drawing.strokeWidth = 2

    if (data.owner === -1) {
        drawing.strokeColor = 'black';
        drawing.fillColor   = '#D3D3D3'
    } else {
        // red and red background
        drawing.strokeColor = '#B81111'
        drawing.fillColor   = '#F0CFCF'
    }

    drawing.onMouseDown = function(event) {
        claimCell(cellID);
    }

    drawing.onMouseEnter = function(event) {
        this.strokeWidth = 4;
    }

    drawing.onMouseLeave = function(event) {
        this.strokeWidth = 2;
    }

    var text = new paper.PointText({
        point: drawing.position,
        content: data.size,
        justification: 'center',
        fontSize: 25
    });

    text.onMouseEnter = function(event) {
        drawing.strokeWidth = 4;
    }

    text.onMouseLeave = function(event) {
        drawing.strokeWidth = 2;
    }

    return new Cell.Cell(cellID, data.x, data.y, data.radius, data.size, drawing, text);
};


function onUpdateCell(data) {
    if (Object.keys(cells).length == 0) {
        console.log("There are no cells!")
        return;
    }

    var cell = cells[data.id]

    if (cell) {
        cell.getText().content = data.size;
        cell.setOwner(data.owner);
    }
}



function claimCell(cellID) {
    var cell = cells[cellID];

    if (cell) {
        socket.emit("claim cell", {id: cellID});
    } else {
        console.log("ClaimCell: No cell found!");
        return;
    }
}
