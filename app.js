var express = require('express');
var path = require('path');

var app = express();
var port = 8888;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// include static files
app.use(express.static(path.join(__dirname, 'public')));

// upload destination setup
app.set('files', path.join(__dirname, '/public/files'));

var index = require('./routes/index');

// router
app.get('/upload', index.list);
app.post('/upload', index.submit(app.get('files')));
app.get('/file/:id/download', index.download(app.get('files')));

var server = app.listen(port);
console.log("Listening on port: " + port);

var io = require('socket.io')(server);
app.set('socketio', io); // store a reference to the io object, can be passed to routes
