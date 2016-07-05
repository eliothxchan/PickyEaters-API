(function() {
	
	console.log("Test Client 1: Captain Starting");
	var client = require('socket.io-client');
	var socket = client.connect('http://localhost:3000');
	var restaurantList = [];

	console.log('Captain joining the room.');
	socket.emit('createSession', [
		{
			id: 'abc',
			name: 'Kismet',
			phone: '416-111-1111',
			rating: 4.5,
			address: '10 University Ave',
			description: 'Indian',
			imageUrl: 'www.kismet.com',
			distance: 2.5,
			vetoed: false
		},
		{
			id: 'def',
			name: 'The Grill',
			phone: '416-222-2222',
			rating: 3.5,
			address: '15 University Ave',
			description: 'Burgers',
			imageUrl: 'www.thegrill.com',
			distance: 2.5,
			veteod: false
		}
	]);

	socket.on('created', function(sessionId) {
		console.log('Created with session id ' + sessionId);
		socket.disconnect();
	});	

	socket.on('joined', function(numUsers) {
		console.log('A user joined the room. Room is now at ' + numUsers + ' users.');
	});



})();