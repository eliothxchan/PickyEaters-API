(function() {

	module.exports = function(io) {

		var module = {};

		module.emit = function emit(room, eventType, data) {
			io.to(room).emit(eventType, data);
		}

		module.emitStartSession = function emitStartSession(room, votes, restaurants) {
			io.to(room).emit('started', votes, restaurants);
		}

		module.emitError = function emitError(room, data) {
			io.to(room).emit('error', data);
		};

		return module;
	};

})();