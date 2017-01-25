const PLAYER_SIZE = 20;

/**************************************************
** GAME PLAYER CLASS
**************************************************/
var Player = function(startX, startY, color) {
    var x = startX,
        y = startY,
        id,
        moveAmount = 2;

    var path = new paper.Path.Circle(new paper.Point(startX, startY), 30);
    path.fillColor = color;

    var update = function(keys) {
        var prevX = x,
        prevY = y;

        // Up key takes priority over down
        if (keys.up) {
            y -= moveAmount;
        } else if (keys.down) {
            y += moveAmount;
        };

        // Left key takes priority over right
        if (keys.left) {
            x -= moveAmount;
        } else if (keys.right) {
            x += moveAmount;
        };

        // todo: fix diagonal movement bug

        return prevX != x || prevY != y
    };

    var getX = function() {
        return x;
    };

    var getY = function() {
        return y;
    };

    var setX = function(newX) {
        x = newX;
    };

    var setY = function(newY) {
        y = newY;
    };

    var setPosition = function(newX, newY) {
        setX(newX);
        setY(newY);
        path.setPosition([newX, newY]);
    }

    var draw = function(ctx) {
        ctx.fillRect(x - (PLAYER_SIZE / 2), y - (PLAYER_SIZE / 2), PLAYER_SIZE, PLAYER_SIZE);
    };

    return {
        update: update,
        draw: draw,
        getX: getX,
        getY: getY,
        setX: setX,
        setY: setY,
        setPosition: setPosition // yuck
    }
};
