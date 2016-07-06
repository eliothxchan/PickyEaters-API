(function() {

	module.exports = function(io) {

		var module = {};
		var socketEmitter = require('./socketEmitter')(io);
		var helper = require('.././helper');
		var db = require('../db/database');

		module.handleCreateSession = function handleCreateSession(socket) {
		
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

			var session;

			db.getById(room, function(error, docs) {
				if (!error) {
					session = docs[0];
					if (!session.started) {

						db.addUserToSession(socket.id, room, function(success) {
							if (success) {
								socketEmitter.emit(socket.id, 'joined', session.restaurants);
								socketEmitter.emit(session.captainId, 'joined', io.sockets.adapter.rooms[room].length + 1);
								console.log(socket.id + ' has joined room ' + room + '.');
							}
						});
					} else {
						console.log('Session ' + room + ' has already begun.');
					}					
				}

			});

		};

		module.handleStartSession = function handleStartSession(socket, restaurantData) {
			
			console.log(socket.id + ' is attempting to start its session.');

			var room = helper.getNonIdRoom(socket);

			db.assignVotesAndStartSession(room, restaurantData, function(updatedUsersArray) {
				console.log('Session has started.');
				for (var i = 0; i < updatedUsersArray.length; i++) {
					socketEmitter.emit(updatedUsersArray[i].id, 'started', updatedUsersArray[i].votesAssigned);
				}
			});
		};

		
		module.handleVeto = function handleVeto(socket, restaurantName) {
			
			var room = getNonIdRoom(socket);

			db.vetoRestaurant(userId, room, restaurantName, function(errorMessage, numLeft) {
				if (!errorMessage) {
					socketEmitter.emit(room, "vetoed", restaurantName);
					if (numLeft === 1) {
						socketEmitter.emit(room, "finished");
					}
				}
				else if (errorMessage === "Already veteod") {
					socketEmitter.emit(socket.id, 'alreadyVetoed', restaurantName);
				}
			});
		};
		

		module.handleDisconnect = function handleDisconnect(socket) {
			console.log(socket.id + " disconnected.");
			db.removeUserFromSessions(socket.id);
		};
	

		return module;

	};

})();