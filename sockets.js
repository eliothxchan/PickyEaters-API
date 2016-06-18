(function() {
	
	module.exports = function(http) {
		
		var module = {};

		//External APIs
		var io = require('socket.io')(http);

		io.on('connection', function(socket) {
			console.log('A user has connected.');
		});

		return module;

	}

})();