(function() {
	
	module.exports = function(http, db) {
		
		var module = {};

		//External APIs
		var io = require('socket.io')(http);

		//Socket Events
		io.on('connection', function(socket) {
			console.log(socket.id + ' has connected.');

			socket.on('join', function(room) {

				var session;

				//Find room
				db.sessions.find({ _id: room}, function(error, documents) {
					if (!error && documents.length === 1) {
						session = documents[0];

						if (!session.started) {
							socket.join(room);
							io.to(room).emit('joined', room, session.restaurants, io.sockets.adapter.rooms[room].length);
							console.log(socket.id + ' has joined room ' + room + '.');
						} else {
							console.log('Session ' + room + ' has already begun and cannot be joined.');
						}

					} else if (error) {
						console.log('Error: ' + error);
					} else if (documents.length !== 1) {
						console.log('Error: Found ' + documents.length + ' documents where there should only be one.');
					}
				});
				
			});

			socket.on('start', function() {
				//Get user's room
				var room = getNonIdRoom(socket);

				//Update room status if possible
				db.sessions.update({ _id: room }, { $set: { started: true } }, {}, function (error) {
					if (!error) {
						console.log('Session ' + room + ' has started.');
						//Emit start event
						io.to(room).emit('started');
					} else {
						console.log('Error: ' + error);
					}
				});
			});

			socket.on('veto', function(restaurant) {

				var room = getNonIdRoom(socket);

				db.sessions.find({_id: room}, function(error, docs) {
					if (!error) {
						var newRestList = docs[0].restaurants;
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
				
			});

		});


		//Private Functions
		var getNonIdRoom = function getNonIdRooms(socket) {
			//Since all sockets join a room with their particular id on connection
			//we want to get back the singular room they are in that is not the one
			//paired with their id

			var rooms = [];
			var allRooms = Object.keys(socket.rooms);

			for (var i = 0; i < allRooms.length; i++) {
				if (allRooms[i] !== socket.id) {
					rooms.push(allRooms[i]);
				}
			}

			if (rooms.length == 1) {
				return rooms[0];
			}
			else {
				console.log("Error: " + socket.id + " is in more than one non-id room.");
				throw (socket.id + " is in more than one non-id room.");
			}

		};


		return module;

	}

})();