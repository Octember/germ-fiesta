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
        if (paper.Key.isDown('up') || paper.Key.isDown('w')) {
            y -= moveAmount;
        } else if (paper.Key.isDown('down') || paper.Key.isDown('s')) {
            y += moveAmount;
        };

        // Left key takes priority over right
        if (paper.Key.isDown('left') || paper.Key.isDown('a')) {
            x -= moveAmount;
        } else if (paper.Key.isDown('right') || paper.Key.isDown('d')) {
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

    var setPosition = function(newX, newY) {
        x = newX;
        y = newY;
        path.setPosition([newX, newY]);
    }


    // Helper method to destroy the paperjs "path" object
    var destroy = function() {
        path.remove()
    }

    return {
        update: update,
        getX: getX,
        getY: getY,
        setPosition: setPosition,
        destroy: destroy
    }
};
