var net = require('net');
var Player = require('./player');

var players = {};
var index = 1;

var server = net.createServer(function(socket) {
    players[index] = new Player(index, socket);
    players[index].on('HELO', broadcastList);
    players[index].on('LIST', function(id) {
        var playerString = 'LIST\r\n';

        for(var index in players) {
            if(!!players[index].name) {
                playerString += index + ' ' + players[index].name + '\r\n';
            }
        }

        players[id].send(playerString);
    });

    // Listen for the END event that is emitted when the connection with the
    // client was ended.
    players[index].on('END', function(id) {
        // The connection of the player with the specified
        // id was ended so he should be removed from the players
        // list
        delete players[id];

        broadcastList();
    });

    players[index].on('CHAL', function(invoker, receiver) {
        players[receiver].send('CHALV ' + invoker + ' ' + players[invoker].name);
    });

    function broadcastList() {
        var playerString = 'LIST\r\n';

        for(var index in players) {
            if(!!players[index].name) {
                playerString += index + ' ' + players[index].name + '\r\n';
            }
        }

        for(var index in players) {
            if(!!players[index].name) {
                players[index].send(playerString);
            }
        }
    }

    ++index;
});

console.log('Socket started at port 1337');
server.listen(1337);
