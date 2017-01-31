(function(exports) {

    var Cell = function(id, startX, startY, radius, size, paperPath, text, playerOwner) {
        var x      = startX;
        var y      = startY;
        var radius = radius;
        var id     = id;

        var path;
        var text;

        // -1 if no owner / "Neutral", the ID of the player who controls if not
        var owner;

        // Amounts of troops on the cell
        var size;

        if (size !== undefined) {
            size = size;
        } else {
            size = 0;
        }

        if (paperPath !== undefined) {
            path = paperPath;
        }

        if (text !== undefined) {
            text = text;
            text.getCell = function() {
                return this;
            }
        }

        if (playerOwner !== undefined) {
            owner = playerOwner;
        } else {
            owner = -1;
        }

        function getX() {
            return x;
        };

        function getY() {
            return y;
        };

        function getRadius() {
            return radius;
        }

        function getSize() {
            return size;
        }

        function getText() {
            return text;
        }

        function getOwner() {
            return owner;
        }

        function isOwner(id) {
            return owner === id;
        }

        function setX(newX) {
            x = newX;
        };

        function setY(newY) {
            y = newY;
        };

        function setSize(newSize) {
            size = newSize;
        };

        function setOwner(newOwner) {
            owner = newOwner;

            if (path) {
                path.setOwner(newOwner);
            }
        }

        return {
            getX: getX,
            getY: getY,
            setX: setX,
            setY: setY,
            getSize: getSize,
            getRadius: getRadius,
            id:       id,
            getText:  getText,
            setSize:  setSize,
            getOwner: getOwner,
            setOwner: setOwner,
            isOwner:  isOwner,
            paperPath: path
        }
    };

    exports.Cell = Cell;
})(typeof exports === 'undefined' ? this['Cell'] = {} : exports);
