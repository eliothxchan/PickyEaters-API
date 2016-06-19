(function() {
	
	console.log("What's up");
	var client = require('socket.io-client');
	var socket = client.connect('http://localhost:3000');

	socket.emit('join', 'room1');

	socket.emit('veto', 'swag');

	socket.on('killRestaurant', function(restaurantName) {
		console.log('Killed a restaurant.');
	});

})();