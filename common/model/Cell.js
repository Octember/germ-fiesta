(function(exports) {

    var Cell = function(id, startX, startY, radius, size, paperPath, text) {
        var x = startX;
        var y = startY;
        var radius = radius;
        var id = id;

        var size = 0;

        var path;
        var text;

        if (size !== undefined) {
            size = size;
        }

        if (paperPath !== undefined) {
            path = paperPath;
        }

        if (text !== undefined) {
            text = text;
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

        var setX = function(newX) {
            x = newX;
        };

        var setY = function(newY) {
            y = newY;
        };

        var setSize = function(newSize) {
            size = newSize;
        };


        return {
            getX: getX,
            getY: getY,
            setX: setX,
            setY: setY,
            getSize: getSize,
            getRadius: getRadius,
            id: id,
            getText: getText,
            setSize: setSize
        }
    };

    exports.Cell = Cell;
})(typeof exports === 'undefined' ? this['Cell'] = {} : exports);
