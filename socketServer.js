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
    var cell = new Cell(guid(), 200, 200, 30);
    cell.setOwner(10);
    cells[cell.id] = cell;

    cell = new Cell(guid(), 800, 250, 40, 5);
    cells[cell.id] = cell;

    cell = new Cell(guid(), 450, 600, 50, 5);
    cells[cell.id] = cell;

    cell = new Cell(guid(), 300, 280, 40, 5);
    cells[cell.id] = cell;

    cell = new Cell(guid(), 550, 480, 60, 5);
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
    client.on("attack cell", onAttackCell);
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

    // tell the new player about existing cells
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

    var newPlayer = new Player(this.id);
    newPlayer.cells.push(newCell.id);

    players[this.id] = newPlayer;
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
        broadcastUpdatedCell(cell);
    } else {
        console.log("onClaimCell: No cell found!");
    }
}


function onAttackCell(data) {
    var fromCell = cells[data.from];
    var toCell   = cells[data.to];

    // In the future this should be delayed, not immediate.
    if (fromCell && toCell) {
        attackCell(fromCell, toCell);
        broadcastUpdatedCell(fromCell);
        broadcastUpdatedCell(toCell);
    } else {
        console.log("onAttackCell: Cells not found!")
    }
}

function attackCell(attacker, defender) {

    var numTroops = Math.floor(attacker.getSize() / 2);

    attacker.setSize(attacker.getSize() - numTroops);

    // Are the troops of the same owner? Battle if not
    if (attacker.getOwner() === defender.getOwner()) {
        defender.setSize(defender.getSize() + numTroops);
    } else {
        // Any custom defense / attack logic could be put in here
        var remainingTroops = defender.getSize() - numTroops;

        if (remainingTroops < 0) {
            defender.setOwner(attacker.getOwner());
            defender.setSize(-remainingTroops);
        } else {
            defender.setSize(remainingTroops);
        }
    }

}

function broadcastUpdatedCell(cell) {
    io.sockets.emit('update cell', {
        id: cell.id,
        size: cell.getSize(),
        owner: cell.getOwner()
    });
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
            broadcastUpdatedCell(cell);
        }
    });
}

init();

// Every 500 ms, update cells
setInterval(updateCells, 1000 );
