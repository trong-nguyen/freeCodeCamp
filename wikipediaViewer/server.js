var express = require('express');
var app = express();
var path = require('path');

app.use(express.static(path.join(__dirname, '.')));

var server = app.listen(8080, function() {

});