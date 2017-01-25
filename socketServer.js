var util = require("util");
var socketio = require("socket.io");
var Player = require("./Player").Player;

var io; // The reference to sockio, on port 8000. This is a socketio standard
var players; // The players in the room

function init() {
    players = {};

    io = socketio(8000);

    setEventHandlers();
};

var setEventHandlers = function() {
    io.sockets.on("connection", onSocketConnection);
};


function onSocketConnection(client) {
    util.log("New player has connected: "+client.id);
    client.on("disconnect", onClientDisconnect);
    client.on("new player", onNewPlayer);
    client.on("move player", onMovePlayer);
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

init();

// every half second, update player positions
setInterval(notifyPlayersMoved, 1000 / 30);
