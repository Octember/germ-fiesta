(function(exports) {

    var Player = function(startX, startY, path) {
        var x = startX,
            y = startY,
            id;

        var path;

        if (path !== undefined) {
            path = path;
        }

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
            x = newX;
            y = newY;
            if (path) {
                path.setPosition([newX, newY]);
            }
        }

        return {
            getX: getX,
            getY: getY,
            setX: setX,
            setY: setY,
            id: id,
            setPosition: setPosition
        }
    };

    exports.Player = Player;
    exports.PLAYER_MOVE_AMOUNT = 2;
})(typeof exports === 'undefined' ? this['Player'] = {} : exports);
