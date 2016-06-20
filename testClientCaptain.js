(function() {
	
	console.log("Test Client 1: Captain Starting");
	var client = require('socket.io-client');
	var socket = client.connect('http://localhost:3000');
	var restaurantList = [];

	console.log('Captain joining the room.');
	socket.emit('join', 'A412C');

	socket.on('joined', function(room, restaurants, users) {
		if (users === 1) {
			restaurantList = restaurants;
			console.log('Captain has joined room ' + room + '. Restaurants have been updated.');
			console.log('Restaurant list: ' + restaurantList);
		}
		else if (users === 2) {
			console.log('A user has joined the room. Starting veto process.');
			socket.emit('start');
		}
	});

	socket.on('started', function() {
		console.log('Captain is deciding what to veto.');
		var item = restaurantList[Math.floor(Math.random() * restaurantList.length)];
		console.log('Captain has decided to veto ' + item + '.');
		socket.emit('veto', item);
	});

	socket.on('vetoed', function(remainingRestaurants) {
		console.log('Veto received. Restaurants have been updated.');
		restaurantList = remainingRestaurants;
		console.log('Restaurant list: ' + restaurantList);

		if (restaurantList.length % 2 === 0 && restaurantList.length !== 1) {
			console.log('Captain is deciding what to veto.');
			var item = restaurantList[Math.floor(Math.random()*restaurantList.length)];
			console.log('Captain has decided to veto ' + item + '.');
			socket.emit('veto', item);			
		}

	});

	socket.on('finished', function(restaurant) {
		console.log('Veto process has complete. The group has chosen ' + restaurant + '.');
	});

})();