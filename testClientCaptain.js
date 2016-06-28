(function() {
	
	console.log("Test Client 1: Captain Starting");
	var client = require('socket.io-client');
	var socket = client.connect('http://localhost:3000');
	var restaurantList = [];

	console.log('Captain joining the room.');
	socket.emit('createSession', []);

	socket.on('created', function(sessionId) {
		console.log('Created with session id ' + sessionId);

		socket.disconnect();
	});	

})();