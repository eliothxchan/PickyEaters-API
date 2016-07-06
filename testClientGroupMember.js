(function() {
	
	console.log("Test Client 2: Group Member Starting");
	var client = require('socket.io-client');
	var socket = client.connect('http://localhost:3000');
	var restaurantList = [];

	console.log('Group Member joining the room.');
	socket.emit('join', '4ph5');

	socket.on('joined', function(restaurants) {
		console.log('Group Member has joined the room.');
		console.log('Restaurant list: ' + restaurants);
	});

	socket.on('started', function(numVetos) {
		console.log('Group Member has been assigned ' + numVetos + ' vetoes.');
		socket.emit('veto', 'Kismet');
	});

	socket.on('vetoed', function(restaurantVetoed) {
		console.log(restaurantVetoed + ' has been veteod.');
	});

	socket.on('finished', function() {

	});

})();