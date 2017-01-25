(function(exports) {

    var Cell = function(startX, startY, radius, paperPath) {
        var x = startX,
            y = startY,
            radius = radius,
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

        var getRadius = function() {
            return radius;
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
            getRadius: getRadius,
            id: id
        }
    };

    exports.Cell = Cell;
})(typeof exports === 'undefined' ? this['Cell'] = {} : exports);
