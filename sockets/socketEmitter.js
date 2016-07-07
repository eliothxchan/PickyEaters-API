(function() {

	module.exports = function(io) {

		var module = {};

		module.emit = function emit(room, eventType, data) {
			io.to(room).emit(eventType, data);
		};

		module.emitStartedToUser = function emitStartedToUser(userId, votes, restaurants) {
			io.to(userId).emit('started', votes, restaurants);
		};

		module.emitVetoToUser = function emitVetoToUser(userId, voteCounted, restaurant) {
			io.to(userId).emit('vetoed', voteCounted, restaurant);
		};

		module.emitError = function emitError(room, data) {
			io.to(room).emit('error', data);
		};

		return module;
	};

})();