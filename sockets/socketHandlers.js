(function() {

	module.exports = function(io) {

		var module = {};
		var socketEmitter = require('./socketEmitter')(io);
		var helper = require('.././helper');
		var db = require('../db/database');

		module.handleCreateSession = function handleCreateSession(socket, restaurantData) {
		
			console.log(socket.id + ' is attempting to creating a room.');

			var tempSessionId;
			var sessions = [];
			var newSession = {};

			do {
				tempSessionId = helper.makeSessionId();
				db.getById(tempSessionId, function(error, docs) {
					sessions = docs[0];
				});

			} while (sessions.length !== 0);	

			db.insertNewSession(tempSessionId, socket.id, restaurantData);
			socket.join(tempSessionId);

			socketEmitter.emit(socket.id, 'created', tempSessionId);
			console.log(socket.id + ' created a room with id ' + tempSessionId + '.');
		};


		module.handleJoinSession = function handleJoinSession(socket, room) {
			
			console.log(socket.id + ' is attempting to join room ' + room + '.');

			var sessions;
			var newUser = {};

			var session = db.getById(room)[0];
			if (!session.started && session.users.length < session.maxUsers) {

				db.addUserToSession(socket.id, room);

				socketEmitter.emit(socket.id, 'joined', session.restaurants);
				socketEmitter.emit(session.captainId, 'joined', io.sockets.adapter.rooms[room].length);
				console.log(socket.id + ' has joined room ' + room + '.');
			} else {
				console.log('Session ' + room + ' has already begun or is full and cannot be joined.');
			}
		};

		module.handleStartSession = function handleStartSession(socket) {

		};

		
		module.handleVeto = function handleVeto(socket, restaurantName) {
			var room = getNonIdRoom(socket);

			/*
			db.update({ _id: room }, { $set: {restaurants: }})

			db.find({_id: room}, function(error, docs) {

				if (!error) {

					var newRestaurantList = docs[0].restaurants;
					newRestList.splice(newRestList.indexOf(restaurant), 1);

					db.sessions.update({ _id: room }, { $set: {restaurants: newRestList}}, {}, function(error) {
						if (!error) {
							if (newRestList.length > 1) {
								io.to(room).emit('vetoed', newRestList);
							}
							else if (newRestList.length === 1) {
								io.to(room).emit('finished', newRestList[0]);
							}
						}
					});
				}
			});
			*/
		};
		

		module.handleDisconnect = function handleDisconnect(socket) {
			console.log(socket.id + " disconnected.");
			db.removeUserFromSessions(socket.id);
		};
	

		return module;

	};

})();