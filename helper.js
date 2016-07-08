(function() {

	var makeSessionId = function makeSessionId()
	{
	    var text = "";
	    var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

	    for( var i=0; i < 4; i++ )
	        text += possible.charAt(Math.floor(Math.random() * possible.length));

	    return text;
	}

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

	module.exports = {
		makeSessionId: makeSessionId,
		getNonIdRoom: getNonIdRoom
	};
	
})();