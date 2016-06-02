(function() {
	var makeSessionId = function makeSessionId()
	{
	    var text = "";
	    var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

	    for( var i=0; i < 4; i++ )
	        text += possible.charAt(Math.floor(Math.random() * possible.length));

	    return text;
	}

	module.exports.makeSessionId = makeSessionId;
})();