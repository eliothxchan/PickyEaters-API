(function() {

	var makeSessionId = function makeSessionId()
	{
	    var text = "";
	    var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

	    for( var i=0; i < 4; i++ )
	        text += possible.charAt(Math.floor(Math.random() * possible.length));

	    return text;
	}

	var createSessionRequestBodyIsValid = function createSessionRequestBodyIsValid(requestBody) {
		
		//Basic sanity check on request body's fields
		if (requestBody &&
			requestBody.captainId && 
			requestBody.captainId !== null && requestBody.captainId !== "" &&
			requestBody.restaurants && 
			(requestBody.restaurants instanceof Array) && requestBody.restaurants.length > 1) {
			return true;
		}
		return false;
	}

	module.exports.makeSessionId = makeSessionId;
	module.exports.createSessionRequestBodyIsValid = createSessionRequestBodyIsValid;
})();