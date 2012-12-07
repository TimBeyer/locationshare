var config = require('./config'),
    http = require('http'),
    less = require("less"),
    _ = require("underscore"),
    utils = require("./utils");

var app = config.app;

app.get("*.less", function(req, res) {
    var path = __dirname + req.url;
    fs.readFile(path, "utf8", function(err, data) {
        if (err) throw err;
        less.render(data, function(err, css) {
            if (err) throw err;
            res.header("Content-type", "text/css");
            res.send(css);
        });
    });
});

// Socket.io workaround
var fs = require('fs');
app.get('/socket.io/socket.io.js', function(req, res) {
    fs.readFile('./node_modules/socket.io/node_modules/socket.io-client/dist/socket.io.js', function(error, content) {
        if (error) {
            res.writeHead(500);
            res.end();
        }
        else {
            res.writeHead(200, { 'Content-Type': 'text/javascript' });
            res.end(content, 'utf-8');
        }
    });
});

var io = require('socket.io').listen(3030);

io.sockets.on('connection', function (socket) {
    socket.emit('location_update', { hello: 'world' });
    socket.on('my other event', function (data) {
        console.log(data);
    });
});

/*
* Serve resources under /public. This is a hack because '/public' shouldn't be in the source map url
* TODO do this better
*/
/*var publicRouter = function(req, res){
    var originalUrl = req.originalUrl;
    var choppedUrl = originalUrl.substr('/public'.length, originalUrl.length);
    res.redirect(choppedUrl);
}*/

var showMap = function(req, res){
    res.sendfile('views/map.html');
};

var createMap = function(req, res){
    // Create unique id for map channel
    utils.getUUID(function(uuid){
        res.redirect("/map/" + uuid);
    });
}

var routes = {
    '/': createMap,
    '/map/:id' : showMap
};

_.each(routes, function(handler, route){
    app.get(route, handler);
});

http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});
