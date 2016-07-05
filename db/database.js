(function() {

	var Datastore = require('nedb');
	var db = new Datastore({
		filename: './sessions.db',
		autoload: true
	});

	//Accessors

	var getById = function getById(id, callback) {

		db.find({ _id: id}, function (error, docs) {
			if (!error) {
				callback(null, docs);	
			}
		});
	};

	//Modifiers
	var insertNewSession = function insert(roomId, captId, restaurantData) {
		var newSession = {
			_id: roomId,
			captainId: captId,
			restaurants: restaurantData,
			maxUsers: restaurantData.length,
			started: false,
			users: [{
				id: captId,
				votesUsed: 0,
				votesAssigned: 0
			}]
		};

		db.insert(newSession);
	};

	var addUserToSession = function addUserToSession(userId, sessionId) {

		var newUser = {
			id: socket.id,
			votesUsed: 0,
			votesAssigned: 0
		}
		db.update({_id: sessionId}, {$push: {"users": newUser} });

	};

	var removeUserFromSessions = function removeUserFromSessions(userId) {

		var session;
		var updatedSessionUsers = [];

		db.find({ $where: function() {
			var foundUserId = false;
			for (var i = 0; i < this.users.length; i++) {
				if (this.users[i].id === userId) {
					foundUserId = true;
				}
			}
			return foundUserId;
		}}, function (error, docs) {
			if (!error) {
				session = docs[0];

				for (var i = 0; i < session.users.length; i++) {
					if (session.users[i].id !== userId) {
						updatedSessionUsers.push(session.users[i]);
					}
				}

				db.update({_id: session._id}, {$set: {"users": updatedSessionUsers}}, {"returnUpdatedDocs" : true}, 
					function(error, numAffected, affectedDoc) {
						if (!error && numAffected === 1) {
							if (affectedDoc.users.length === 0) {
								console.log('Room ' + affectedDoc._id + ' has no more users and will be removed.');
								db.remove({_id: affectedDoc._id});
							}
						}
						else {
							console.log('Error removing user from session after disconnect.');
							console.log(error);
						}
					}
				);
			}
			else {
				console.log(error);
			}
		});

	};

	module.exports = {
		getById: getById,
		insertNewSession: insertNewSession,
		addUserToSession: addUserToSession,
		removeUserFromSessions: removeUserFromSessions
	};

})();