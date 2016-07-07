(function() {

	module.exports = function(io) {

		var module = {};
		var socketEmitter = require('./socketEmitter')(io);
		var helper = require('.././helper');
		var db = require('../db/database');

		module.handleCreateSession = function handleCreateSession(socket) {
		
			console.log(socket.id + ' is attempting to creating a room.');

			var tempSessionId;
			var session;
			var newSession = {};

			do {
				tempSessionId = helper.makeSessionId();
				db.getById(tempSessionId, function(error, doc) {
					if (!error) {
						session = doc;
					}
				});

			} while (session);	

			db.insertNewSession(tempSessionId, socket.id);
			socket.join(tempSessionId);

			socketEmitter.emit(socket.id, 'created', tempSessionId);
			console.log(socket.id + ' created a room with id ' + tempSessionId + '.');
		};


		module.handleJoinSession = function handleJoinSession(socket, room) {
			
			console.log(socket.id + ' is attempting to join room ' + room + '.');

			var session;

			db.getById(room, function(error, doc) {
				if (!error) {
					session = doc;
					if (!session.started) {

						db.addUserToSession(socket.id, room, function(success) {
							if (success) {
								if (socket.id !== session.captainId) {
									socketEmitter.emit(socket.id, 'joined');
								}
								socketEmitter.emit(session.captainId, 'joined', io.sockets.adapter.rooms[room].length + 1);
								console.log(socket.id + ' has joined room ' + room + '.');
							}
						});
					} else {
						console.log('Session ' + room + ' has already begun and cannot be joined.');
					}					
				}

			});

		};

		module.handleStartSession = function handleStartSession(socket, restaurantData) {
			
			console.log(socket.id + ' is attempting to start its session.');

			var room = helper.getNonIdRoom(socket);

			db.assignVotesAndStartSession(room, restaurantData, function(updatedUsersArray, restaurants) {
				console.log('Session has started.');
				for (var i = 0; i < updatedUsersArray.length; i++) {
					socketEmitter.emitStartedToUser(updatedUsersArray[i].id, updatedUsersArray[i].votesAssigned, restaurants);
				}
			});
		};

		
		module.handleVeto = function handleVeto(socket, restaurantName) {
			
			console.log(socket.id + ' is attempting to veto ' + restaurantName);

			var room = helper.getNonIdRoom(socket);

			db.vetoRestaurant(socket.id, room, restaurantName, function(worked, users) {
				console.log(socket.id + ' vetoed ' + restaurantName + ' successfully.');

				for (var i = 0; i < users.length; i++) {
					if (users[i].id === socket.id) {
						socketEmitter.emitVetoToUser(socket.id, worked, restaurantName);
					}
					else {
						socketEmitter.emitVetoToUser(users[i].id, false, restaurantName);
					}
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