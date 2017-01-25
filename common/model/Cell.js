(function(exports) {

    var Cell = function(id, startX, startY, radius, paperPath, textPath) {
        var x = startX;
        var y = startY;
        var radius = radius;
        var count = 0;
        var id = id;

        var path;
        var text;

        if (paperPath !== undefined) {
            path = paperPath;
        }

        if (textPath !== undefined) {
            text = textPath;
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
