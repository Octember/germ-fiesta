(function(exports) {

    var Player = function(id) {
        var cells = [];
        var id;

        if (id !== undefined) {
            id = id;
        }

        return {
            cells: cells,
            id:    id
        }
    };

    exports.Player = Player;
})(typeof exports === 'undefined' ? this['Player'] = {} : exports);
