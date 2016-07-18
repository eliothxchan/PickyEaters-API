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
				if (docs && docs.length === 1) {
					callback(null, docs[0]);
				}	
			} 
			else {
				console.log('Error in finding session with id ' + id);
				console.log(error);
			}
		});
	};

	var checkIfCanVeto = function checkIfCanVeto(id, sessionId, callback) {
		var session;

		getById(sessionId, function (error, doc) {
			if (!error) {
				session = doc;

				for (var i = 0; i < session.users.length; i++) {
					if (session.users[i].id === id) {
						callback(session.users[i].votesUsed < session.users[i].votesAssigned);
					}
				}
			}
		});
	};

	//Modifiers
	var insertNewSession = function insert(roomId, captId) {
		var newSession = {
			_id: roomId,
			captainId: captId,
			restaurants: [],
			started: false,
			users: [{
				id: captId,
				votesUsed: 0,
				votesAssigned: 0
			}]
		};

		db.insert(newSession);
	};

	var addRestaurantsToSession = function addRestaurantsToSession(sessionId, restaurantData, callback) {

		db.update({_id: sessionId}, {$set: {"restaurants": restaurantData}}, {},
			function(error, numAffected) {
				if (!error && numAffected === 1) {
					callback(true);
				}
				else {
					console.log('Could not update session ' + sessionId + ' with the given restaurants.');
					console.log(error);
					callback(false);
				}
			}
		);
	};

	var addUserToSession = function addUserToSession(userId, sessionId, callback) {

		var newUser = {
			id: userId,
			votesUsed: 0,
			votesAssigned: 0
		};

		db.update({_id: sessionId}, {$push: {"users": newUser} }, {}, function(error, numAffected) {
			if (!error && numAffected === 1) {
				callback(true);
			}
			else {
				console.log(error);
				callback(false);
			}
		});

	};

	var vetoRestaurant = function vetoRestaurant(userId, sessionId, restaurantName, callback) {
		var session;
		var updatedRestaurants;

		checkIfCanVeto(userId, sessionId, function(canVeto) {
			if (canVeto) {
				getById(sessionId, function (error, doc) {
					if (!error) {
						session = doc;
						updatedRestaurants = session.restaurants;

						for (var i = 0; i < updatedRestaurants.length; i++) {
							if (updatedRestaurants[i].name === restaurantName) {
								updatedRestaurants[i].veteod = true;
								break;
							}
						}

						db.update({_id: sessionId}, {$set: {restaurants: updatedRestaurants}}, {}, function(error, numAffected) {
							if (!error) {
								if (numAffected === 0) {
									callback(false, session.users);
								}
								else if (numAffected === 1) {
									callback(true, session.users);
								}
							}
							else {
								console.log('Could not update session ' + sessionId + ' after vetoing ' + restaurantName);
								console.log(error);
							}
						});

					}
				});
			}
			else {
				console.log('User ' + userId + ' has used all their vetos and can no longer vote.');
			}
		});

	};

	var incrementUserUsedVotes = function incrementUserUsedVotes(userId, sessionId) {
		
		var session;
		var updatedUserArray = [];

		getById(sessionId, function(error, doc) {
			if (!error) {
				session = doc;

				for (var i = 0; i < session.users.length; i++) {
					if (session.users[i].id === userId) {
						updatedUserArray.push({
							id: session.users[i].id,
							votesUsed: session.users[i].votesUsed + 1,
							votesAssigned: session.users[i].votesAssigned
						});
					}
					else {
						updatedUserArray.push(session.users[i]);
					}
				}

				db.update({_id: sessionId}, {$set: {"users": updatedUserArray}});
			}
			else {
				console.log(error);
			}
		});
	};

	var assignVotesAndStartSession = function assignVotesAndStartSession(sessionId, restaurantData, callback) {

		var session;
		var totalVotes;
		var updatedUserArray = [];
		var voteCount = 0;
		var i = 0;
		var newUserObj = {};
		var restaurants;

		addRestaurantsToSession(sessionId, restaurantData, function(restaurantsAdded) {
			if (restaurantsAdded) {
				getById(sessionId, function(error, doc) {
					if (!error) {
						session = doc;
						totalVotes = session.restaurants.length-1;
						updatedUserArray = session.users;
						restaurants = session.restaurants;

						while (voteCount !== totalVotes) {
							if (i === session.users.length) {
								i = 0;
							} 
							newUserObj.id = updatedUserArray[i].id;
							newUserObj.votesUsed = 0;
							newUserObj.votesAssigned = updatedUserArray[i].votesAssigned + 1;

							updatedUserArray[i] = newUserObj;
							i++;
							voteCount++;
							newUserObj = {};
						}

						for (var j = 0; j < updatedUserArray.length; j++) {
							console.log(updatedUserArray[j].id + ' has been assigned ' + updatedUserArray[j].votesAssigned + ' votes.');
						}

						db.update({_id: sessionId}, {$set: {"users": updatedUserArray, "started": true}}, {}, function(error) {
							if (!error) {
								callback(updatedUserArray, restaurants);
							}
							else {
								console.log(error);
							}
						});

					}
					else {
						console.log(error);
					}
				});
			} 
			else {
				console.log('Restaurants could not be added to session ' + sessionId);
			}
		});

	};

	var removeUserFromSessions = function removeUserFromSessions(userId, callback) {

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

			var removedUser;
			var voteCount = 0;
			var j = 0;

			if (!error) {
				if (docs.length === 1) {
					session = docs[0];

					for (var i = 0; i < session.users.length; i++) {
						if (session.users[i].id !== userId) {
							updatedSessionUsers.push(session.users[i]);
						}
						else {
							removedUser = session.users[i];
						}
					}

					//Redistribute remaining votes
					while (voteCount !== (removedUser.votesAssigned - removedUser.votesUsed) && updatedSessionUsers.length !== 0) {
						if (j === updatedSessionUsers.length) {
							j = 0;
						} 

						updatedSessionUsers[j].votesAssigned = updatedSessionUsers[j].votesAssigned + 1;

						j++;
						voteCount++;
					}

					//Update database
					db.update({_id: session._id}, {$set: {"users": updatedSessionUsers}}, {"returnUpdatedDocs" : true}, 
						function(error, numAffected, affectedDoc) {
							if (!error && numAffected === 1) {

								if (removedUser.votesAssigned - removedUser.votesUsed !== 0) {
									callback(updatedSessionUsers);						
								}

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
					console.log('User ' + userId + ' is not in any active sessions.');
				}
			}
			else {
				console.log('Error in finding sessions with userId ' + userId + '.');
				console.log(error);
			}
		});

	};

	module.exports = {
		getById: getById,
		insertNewSession: insertNewSession,
		addRestaurantsToSession: addRestaurantsToSession,
		addUserToSession: addUserToSession,
		assignVotesAndStartSession: assignVotesAndStartSession,
		vetoRestaurant: vetoRestaurant,
		removeUserFromSessions: removeUserFromSessions
	};

})();