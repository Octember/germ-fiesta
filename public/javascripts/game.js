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

    // Initialise the local player
    var path = undefined;//new paper.Path.Circle(new paper.Point(startX, startY), 30);
    // path.fillColor = 'green';
    localPlayer   = new Player.Player();
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

    socket.on("new cell", onNewCell);
    socket.on("update cell", onUpdateCell);
};

/**************************************************
** GAME UPDATE
**************************************************/
function update() {

    // socket.emit("move player", {x: localPlayer.getX(), y: localPlayer.getY()});
};


function onSocketConnected() {
    console.log("Connected to socket server");
    // Make sure to set local player ID
    localPlayer.id = this.id;

    socket.emit("new player");
};


function onSocketDisconnect() {
    console.log("Disconnected from socket server");
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

    drawing.setOwner = function(ownerID) {
        if (ownerID === -1) {
            // yellow for neutral
            drawing.strokeColor = '#C8C65D';
            drawing.fillColor   = '#FFFEBD'
        } else if (ownerID === localPlayer.id) {
            // blue for owner
            drawing.strokeColor = '#27486D'
            drawing.fillColor   = '#8195AA'
        } else {
            // red and red background
            drawing.strokeColor = '#A73D32'
            drawing.fillColor   = '#FFC3BD'
        }
    }
    drawing.setOwner(data.owner);

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
