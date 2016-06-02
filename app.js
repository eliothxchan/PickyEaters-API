var express = require('express');
var app = express();

app.get('/hello', function (request, response) {
    response.send('Hello World? It\'s me, Margaret.');
});

app.listen(3000, function() {
    console.log('Server listening on port 3000.');
});
