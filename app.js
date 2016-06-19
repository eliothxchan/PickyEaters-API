(function() {
	//External APIs
	var express = require('express');
	var bodyParser = require('body-parser');
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

	app.use(bodyParser.json());

	//Internal APIs
	var helper = require('./helper');
	var socket = require('./sockets')(http, db);


	//Routes
	/*
		Create a new session. Returns a session id to the user. This is id
		will then be communicated to other users, and will be the name of the
		socket.io "room" to join.

		@param [type] captainId
		@param [Array of Objects] restaurants
			@param [Object]
				@param [string] restaurantName
				@param [double] latitude
				@param [double] longitude
				@param [boolean] veto
		@return [string] sessionId
	*/
	app.post('/session', function (request, response) {

		if (!helper.createSessionRequestBodyIsValid(request.body)) {
			response.status(500);
			response.json({ error: "Create session request body is invalid."});
			return;
		}

		var tempSessionId;
		var foundDocs = [];

		do {
			//Randomize ID
			tempSessionId = helper.makeSessionId();

			//Check if a document with the given session id already exists in
			//the database
			db.find({ sessionId: tempSessionId}, function (error, documents) {
				if (!error) {
					foundDocs = [];	
				}
				else {
					console.log('Database call failed.');
				}
			});
		} while (foundDocs.length > 0);

		var newSession = {
			_id: tempSessionId,
			started: false,
			captainId: request.body.captainId,
			restaurants: request.body.restaurants
		}

		db.sessions.insert(newSession);

		response.send(tempSessionId);

	});


	//For testing purposes
	app.post('/hello', function (request, response) {
		if (!helper.createSessionRequestBodyIsValid(request.body)) {
			response.status(500);
			response.json({ error: "Create session request body is invalid."});
			return;
		}

		var tempSessionId;
		var foundDocs = [];

		do {
			//Randomize ID
			tempSessionId = helper.makeSessionId();

			//Check if a document with the given session id already exists in
			//the database
			db.find({ sessionId: tempSessionId}, function (error, documents) {
				if (!error) {
					foundDocs = [];	
				}
				else {
					console.log('Database call failed.');
				}
			});
		} while (foundDocs.length > 0);

		var newSession = {
			sessionId: tempSessionId,
			captainId: request.body.captainId,
			restaurants: request.body.restaurants
		}

		db.sessions.insert(newSession)

		response.send(tempSessionId);

	});

	//Server Listen

	http.listen(3000, function () {
	    console.log('Server listening on port 3000.');
	});
})();