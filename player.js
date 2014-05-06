'use strict';

var player = (function() {

	function Player(id, socket) {
		this.id = id;
		this._socket = socket;
		this._events = {};

		console.log('A new player with ID ' + id + ' was connected.');

		var player = this;

		// Listen for when data is send over the socket
		this._socket.on('data', function(data) {
			// Convert the buffer to a string
			data = data.toString();

			// Extract the event and the data out of the data received
			var pos = data.indexOf(' ');

			var event = data.substring(0, pos);
			var result = data.substring(pos+1);

			if(pos == -1) {
				event = data;
				result = undefined;
			}

			// Emit the event with the data
			emit(event, result);			
		});

		// When the client is disconnected
		this._socket.on('end', function() {
			console.log('Client with id ' + player.id + ' disconnected');

			// Let the listeners know that the player was disconnected
			emit('END');			
		});

		// Listen for the HELO event
		this.on('HELO', function(id, name) {
			// Set the name of the player
			player.name = name;

			// Send the greeting back with the id of the player
			player.send('HI ' + id);
		});

		/**
		 * This method is used notify all the listeners of a certain
		 * event.
		 * 
		 * @param  String event The name of the event where all the listeners should be notified from.
		 * @param  String data  The data that should be send to the listener.
		 */
		function emit(event, data) {
			// Retrieve the array of listeners of the event
			var array = player._events[event] || [];

			// Iterate over the array and emit the event
			for(var i=0; i<array.length; i++) {
				array[i](player.id, data);
			}
		}
	}

	/**
	 * This method is used to subscribe to certain events.
	 * 
	 * @param  String   event    The name of the event.
	 * @param  Function callback The callback method that should be invoked when the event occurs.
	 */
	Player.prototype.on = function(event, callback) {
		if(!this._events[event]) {
			this._events[event] = new Array();
		}

		this._events[event].push(callback);
	};

	/**
	 * This method sends the data passes as parameter to the client.
	 * 
	 * @param  String data The data that should be send to the client.
	 */
	Player.prototype.send = function(data) {
		this._socket.write(data);
	};

	return Player;	
})();

module.exports = player;