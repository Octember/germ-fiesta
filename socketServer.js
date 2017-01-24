// For handling user events

var util = require("util"),
    socketio = require("socket.io"),
    Player = require("./Player").Player;

var io,
    players;

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

// TODO: consider making a finite number of moves per a certain amount of time.
// In that case, we would not emit events like this per every user move.
// Instead - queue up player moves per timeframe, execute them all (race conditions?)
// and notify all players the changed state of the game
function onMovePlayer(data) {
    var movedPlayer = players[this.id];

    if (!movedPlayer) {
        util.log("Player not found: " + this.id);
        return;
    };

    util.log("Player moved " + this.id);

    // TODO: Do we trust the client?
    // Could cheat by passing bogus data, also these should be sanitized
    movedPlayer.setX(data.x);
    movedPlayer.setY(data.y);

    // Tell everyone that he moved, lol
    // this.broadcast.emit("move player", {id: movedPlayer.id, x: movedPlayer.getX(), y: movedPlayer.getY()});
};


// Alternative to alerting constantly
function notifyPlayersMoved() {

    // Loop thru players and broadcast players positions
    Object.keys(players).forEach(function(id) {
        var player = players[id];

        io.sockets.emit('move player', {id: player.id, x: player.getX(), y: player.getY()});
    });

}

init();

// every half second, update player positions
setInterval(notifyPlayersMoved, 1000 / 30);
