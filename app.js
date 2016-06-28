(function() {
	//External APIs
	var express = require('express');
	var Datastore = require('nedb');

	var app = express();
	var http = require('http').Server(app);

	//Databases
	var db = {};
	db.users = new Datastore({
		filename: 'db/users.db',
		autoload: true
	});
	db.sessions = new Datastore({
		filename: 'db/sessions.db',
		autoload: true
	});

	//Internal APIs
	var helper = require('./helper');
	//var socket = require('./sockets')(http, db);

	var io = require('socket.io')(http);

	//Socket Events
	io.on('connection', function(socket) {
		console.log(socket.id + ' has connected.');

		/*
			Create Session.
			Only to be used by a captain who wants to create a new session.
			Captain automatically joins.
		*/
		socket.on('createSession', function(restaurantData) {

			var tempSessionId;

			var sessions = [];
			do {
				//Randomize ID
				tempSessionId = helper.makeSessionId();

				//Check if a document with the given session id already exists in
				//the database
				db.sessions.find({ _id: tempSessionId}, function (error, docs) {
					if (!error) {
						sessions = docs;	
					}
					else {
						console.log('Database call failed.');
					}
				});
			} while (sessions.length !== 0);	

			var newSession = {
				_id: tempSessionId,
				captainId: socket.id,
				restaurants: restaurantData,
				maxUsers: restaurantData.length,
				started: false,
				users: [socket.id]
			};	

			db.sessions.insert(newSession);
			socket.join(tempSessionId);

			io.to(socket.id).emit('created', tempSessionId);

		});

		/*
			Join Existing Session
		*/
		socket.on('join', function(room) {

			var session;

			//Find room
			db.sessions.find({ _id: room}, function(error, documents) {
				if (!error) {
					session = documents[0];

					if (!session.started && session.users.length < maxUsers) {
						socket.join(room);

						db.sessions.update({_id: room}, {$push: {users: socket.id}});

						io.to(socket.id).emit('joined', session.restaurants);
						io.to(session.captainId).emit('joined', io.sockets.adapter.rooms[room].length);
						console.log(socket.id + ' has joined room ' + room + '.');
					} else {
						console.log('Session ' + room + ' has already begun or is full and cannot be joined.');
					}

				} else {
					console.log('Error: ' + error);
				}
			});
			
		});


		/* 
			Start Session
		*/
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

		socket.on('disconnect', function() {

			var room = getNonIdRoom(socket);

			db.update({_id: room}, {$pull: { users: socket.id }});

			db.find({_id: room}, function(error, docs) {
				if (!error && docs[0].users.length === 0) {
					db.remove({_id: room}, {}, function (err, numRemoved) {
						console.log('Removed ' + numRemoved + ' sessions.');
					});
				}
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
			else if (rooms.length !== 1) {
				console.log("Error: " + socket.id + " is in " + rooms.length + " non-id room.");
			}

		};

	});

	//Server Listen
	http.listen(3000, function () {
	    console.log('Server listening on port 3000.');
	});
})();