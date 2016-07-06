(function() {
	//External APIs
	var express = require('express');
	var app = express();
	var http = require('http').Server(app);

	//Internal APIs
	var io = require('socket.io')(http);
	var socketEventHandlers = require('./sockets/socketHandlers')(io);

	//Socket Events
	io.on('connection', function(socket) {
		console.log(socket.id + ' has connected.');


		socket.on('createSession', function(restaurantData) {
			socketEventHandlers.handleCreateSession(socket, restaurantData);
		});

		
		socket.on('join', function(room) {
			socketEventHandlers.handleJoinSession(socket, room);
		});

		socket.on('start', function(restaurantData) {
			socketEventHandlers.handleStartSession(socket, restaurantData);
		});

		socket.on('veto', function(restaurantName) {
			socketEventHandlers.handleVeto(socket, restaurantName);
		});

		socket.on('disconnect', function() {
			socketEventHandlers.handleDisconnect(socket);
		});

	});

	app.get('/', function(request, response) {
		response.send('Hello world!');
	});

	//Server Listen (3000 for development)
	http.listen(3000, function() {
	//http.listen((process.env.PORT || 80), function () {
	    console.log('Server listening on port 3000');
	});
})();