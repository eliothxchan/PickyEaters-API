(function() {

	module.exports = function(io) {

		var module = {};

		module.emit = function emit(room, eventType, data) {
			io.to(room).emit(eventType, data);
		}

		module.emitError = function emitError(room, data) {
			io.to(room).emit('error', data);
		};

		return module;
	};

})();