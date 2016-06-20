(function() {
	
	console.log("Test Client 2: Group Member Starting");
	var client = require('socket.io-client');
	var socket = client.connect('http://localhost:3000');
	var restaurantList = [];

	console.log('Group Member joining the room.');
	socket.emit('join', 'A412C');

	socket.on('joined', function(room, restaurants, users) {
		restaurantList = restaurants;
		console.log('Group Member has joined room ' + room + '. Restaurants have been updated.');
		console.log('Restaurant list: ' + restaurantList);
	});

	socket.on('vetoed', function(remainingRestaurants) {
		console.log('Veto received. Restaurants have been updated.');
		restaurantList = remainingRestaurants;
		console.log('Restaurant list: ' + restaurantList);

		if (restaurantList.length % 2 === 1 && restaurantList.length !== 1) {
			console.log('Group Member is deciding what to veto.');
			var item = restaurantList[Math.floor(Math.random()*restaurantList.length)];
			console.log('Group Member has decided to veto ' + item + '.');
			socket.emit('veto', item);			
		}

	});

	socket.on('finished', function(restaurant) {
		console.log('Veto process has complete. The group has chosen ' + restaurant + '.');
	});

})();