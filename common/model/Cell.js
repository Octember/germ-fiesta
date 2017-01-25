(function(exports) {

    var Cell = function(startX, startY, size, paperPath) {
        var x = startX,
            y = startY,
            size = size,
            id; // assigned manually

        var path;

        if (paperPath !== undefined) {
            path = paperPath;
        }

        var getX = function() {
            return x;
        };

        var getY = function() {
            return y;
        };

        var getSize = function() {
            return size;
        }

        var setX = function(newX) {
            x = newX;
        };

        var setY = function(newY) {
            y = newY;
        };

        return {
            getX: getX,
            getY: getY,
            setX: setX,
            setY: setY,
            getSize: getSize,
            id: id
        }
    };

    exports.Cell = Cell;
})(typeof exports === 'undefined' ? this['Cell'] = {} : exports);
