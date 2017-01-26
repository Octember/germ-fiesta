var util = require("util");
var socketio = require("socket.io");
var Player = require("./Player").Player;
var Cell = require("./common/model/Cell").Cell;
var guid = require("./utility").guid;

var io; // The reference to sockio, on port 8000. This is a socketio standard

var players; // The players in the room
var cells;


function init() {
    players = {};

    cells = []
    var i;
    for (i = 0; i < 3; i++) {
        // Random-ish positions and sizes
        var cell = new Cell(guid(), 100 + (i * 100), 100 + (i * 100), 20 + (i * 20));
        cells.push(cell);
    }

    io = socketio(8000);

    setEventHandlers();
};


var setEventHandlers = function() {
    io.sockets.on("connection", onSocketConnection);
};


function onSocketConnection(client) {
    util.log("New player has connected: "+client.id);
    client.on("new player", onNewPlayer);
    client.on("move player", onMovePlayer);
    client.on("disconnect", onClientDisconnect);
};


function onNewPlayer(data) {
    var newPlayer = new Player(data.x, data.y);
    newPlayer.id = this.id;

    // Tell existing players about new player
    this.broadcast.emit("new player", {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY()});

    // Tell new player about existing players
    var playerId, existingPlayer;
    for (playerId in players) {
        existingPlayer = players[playerId];
        this.emit("new player", {id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY()});
    };

    // tell him about the cells
    var i, cell;
    for (i = 0; i < cells.length; i++) {
        cell = cells[i];
        this.emit("new cell", {id: cell.id, x: cell.getX(), y: cell.getY(), radius: cell.getRadius(), size: cell.getSize()})
    }

    players[newPlayer.id] = newPlayer;
};


// TODO: queue up player moves per timeframe, execute them all (race conditions?)
function onMovePlayer(data) {
    var movedPlayer = players[this.id];

    if (!movedPlayer) {
        util.log("Player not found: " + this.id);
        return;
    };

    // util.log("Player moved " + this.id);

    // TODO: Do we trust the client?
    // Could cheat by passing bogus data, also these should be sanitized
    movedPlayer.setX(data.x);
    movedPlayer.setY(data.y);

    // Tell everyone that he moved in real time
    // this.broadcast.emit("move player", {id: this.id, x: movedPlayer.getX(), y: movedPlayer.getY()});
};


function onClientDisconnect() {
    util.log("Player has disconnected: "+this.id);

    var removePlayer = players[this.id]

    if (!removePlayer) {
        util.log("Player not found: " + this.id);
        return;
    };

    util.log("Client IDs: ");
    util.log(Object.keys(players));

    delete players[this.id];

    util.log("Broadcasting 'remove player'")

    this.broadcast.emit("remove player", {id: this.id});
};


// Alternative to alerting constantly
function notifyPlayersMoved() {

    // Loop through players and broadcast their positions
    Object.keys(players).forEach(function(id) {
        var player = players[id];
        // don't know why this would happen, but it does
        if (player) {
            io.sockets.emit('move player', {id: id, x: player.getX(), y: player.getY()});
        }
    });
}

function updateCells() {

    var i = 0;
    for (i = 0; i < cells.length; i++) {
        var cell = cells[i];
        cell.setSize(cell.getSize() + 1)

        io.sockets.emit('update cell', {id: cell.id, size: cell.getSize()})
    }

}

function update() {
    notifyPlayersMoved();

    updateCells();
}

init();

// every (1000 / 30) ms, update player positions
setInterval(notifyPlayersMoved, 1000 / 30);
// Every 500 ms, update cells
setInterval(updateCells, 1000 / 2);
