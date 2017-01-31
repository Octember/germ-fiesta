var util = require("util");
var socketio = require("socket.io");
var Player = require("./common/model/Player").Player;
var Cell = require("./common/model/Cell").Cell;
var guid = require("./utility").guid;

var io; // The reference to sockio, on port 8000. This is a socketio standard

var players; // The players in the room
var cells;


function init() {
    players = {};

    cells = {}
    var i;

    // Some arbitrary cells
    var cell = new Cell(guid(), 200, 200, 60);
    cell.setOwner(10);
    cells[cell.id] = cell;

    cell = new Cell(guid(), 500, 250, 60);
    cells[cell.id] = cell;

    cell = new Cell(guid(), 450, 600, 80);
    cells[cell.id] = cell;

    cell = new Cell(guid(), 300, 280, 50);
    cells[cell.id] = cell;

    cell = new Cell(guid(), 550, 480, 60);
    cells[cell.id] = cell;

    io = socketio(8000);

    setEventHandlers();
};


var setEventHandlers = function() {
    io.sockets.on("connection", onSocketConnection);
};


function onSocketConnection(client) {
    util.log("New player has connected: "+client.id);
    client.on("new player",  onNewPlayer);
    client.on("disconnect",  onClientDisconnect);

    client.on("claim cell",  onClaimCell);
};


function onNewPlayer(data) {
    // Calculate a random start position for the local player
    // The minus 5 (half a player size) stops the player being
    // placed right on the egde of the screen
    var startX = 30 + Math.round(Math.random()*(500 - 60)),
        startY = 30 + Math.round(Math.random()*(500 - 60));

    var newCell =  new Cell(guid(), startX, startY, 60);
    newCell.setOwner(this.id);

    // Tell all players about new player, including the player who just connected!
    this.emit("new cell", {
        id:      newCell.id,
        x:       newCell.getX(),
        y:       newCell.getY(),
        radius:  newCell.getRadius(),
        size:    newCell.getSize(),
        owner:   newCell.getOwner()
    });

    // tell him about the cells
    var cellID;
    for (cellID in cells) {
        var cell = cells[cellID];
        this.emit("new cell", {
            id:      cell.id,
            x:       cell.getX(),
            y:       cell.getY(),
            radius:  cell.getRadius(),
            size:    cell.getSize(),
            owner:   cell.getOwner()
        });
    };

    cells[newCell.id] = newCell;
};


function onClientDisconnect() {
    util.log("Player has disconnected: "+this.id);

    var removePlayer = players[this.id]

    if (!removePlayer) {
        util.log("Player not found: " + this.id);
        return;
    };

    delete players[this.id];

    util.log("Broadcasting 'remove player'")

    this.broadcast.emit("remove player", {id: this.id});
};


function onClaimCell(data) {
    var cell = cells[data.id];

    if (cell) {
        cell.setOwner(this.id);
        io.sockets.emit('update cell', {id: cell.id, size: cell.getSize(), owner: cell.getOwner()})
    } else {
        console.log("onClaimCell: No cell found!");
    }
}


function updateCells() {

    var i = 0;
    Object.keys(cells).forEach(function(id) {
        var cell = cells[id];

        var updated = false;

        if (cell.getOwner() !== -1) {
            cell.setSize(cell.getSize() + 1);

            updated = true;
        }

        // Only notify players if it actually updated
        if (updated) {
            io.sockets.emit('update cell', {id: cell.id, size: cell.getSize(), owner: cell.getOwner()})
        }
    });
}

init();

// Every 500 ms, update cells
setInterval(updateCells, 1000 );
