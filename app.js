(function() {
	//External APIs
	var express = require('express');
	var bodyParser = require('body-parser');

	var app = express();
	var http = require('http').Server(app);
	var io = require('socket.io')(http);

	app.use(bodyParser.json());

	//Internal APIs
	var helper = require('./helper');


	//Routes
	/*
		Create a new session
		@param [type] captainId
		@param [Object] restaurants
			@param 
		@return [Object] retObj
			@param [string] sessionId
			@param
	*/
	app.post('/session', function (request, response) {

		var sessionId = helper.makeSessionId();


		return sessionId;

	});


	app.get('/hello', function (request, response) {
	    response.send(helper.makeSessionId());
	});

	http.listen(3000, function () {
	    console.log('Server listening on port 3000.');
	});
})();