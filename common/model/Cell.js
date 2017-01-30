(function(exports) {

    var Cell = function(id, startX, startY, radius, size, paperPath, text, playerOwner) {
        var x = startX;
        var y = startY;
        var radius = radius;
        var id = id;


        var path;
        var text;

        // -1 if no owner / "Neutral", the ID of the player who controls if not
        var owner;

        // Amounts of troops on the cell
        var size = 0;

        if (size !== undefined) {
            size = size;
        }

        if (paperPath !== undefined) {
            path = paperPath;
        }

        if (text !== undefined) {
            text = text;
        }

        if (playerOwner !== undefined) {
            owner = playerOwner;
        } else {
            owner = -1;
        }

        var getX = function() {
            return x;
        };

        var getY = function() {
            return y;
        };

        var getRadius = function() {
            return radius;
        }

        var getSize = function() {
            return size;
        }

        var getText = function() {
            return text;
        }

        var getOwner = function() {
            return owner;
        }

        var setX = function(newX) {
            x = newX;
        };

        var setY = function(newY) {
            y = newY;
        };

        var setSize = function(newSize) {
            size = newSize;
        };

        var setOwner = function(newOwner) {
            owner = newOwner;
        }

        return {
            getX: getX,
            getY: getY,
            setX: setX,
            setY: setY,
            getSize: getSize,
            getRadius: getRadius,
            id: id,
            getText: getText,
            setSize: setSize,
            getOwner: getOwner,
            setOwner: setOwner
        }
    };

    exports.Cell = Cell;
})(typeof exports === 'undefined' ? this['Cell'] = {} : exports);
