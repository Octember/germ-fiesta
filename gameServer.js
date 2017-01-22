// todo

var util = require("util"),
    io = require("socket.io"),
    Player = require("./Player").Player;

var socket,
    players;

function init() {
    players = {};

    socket = io.listen(8000);

    setEventHandlers();
};

var setEventHandlers = function() {
    socket.sockets.on("connection", onSocketConnection);
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

    delete players[this.id]

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
    this.broadcast.emit("move player", {id: movedPlayer.id, x: movedPlayer.getX(), y: movedPlayer.getY()});
};


init();
