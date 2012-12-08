var config = require('./config'),
    http = require('http'),
    less = require("less"),
    _ = require("underscore"),
    Backbone = require("backbone"),
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

var Client = Backbone.Model.extend({

});

var Clients = Backbone.Collection.extend({
    model: client
});

var connectedClients = new Clients();

var io = require('socket.io').listen(3030, {
    transports: ['websocket']
});

var totalClients = 0;

io.sockets.on('connection', function (socket) {
    totalClients += 1;

    console.log("New client connected. Total Clients: ", totalClients);
    // Save a unique ID for this client
    socket.set('clientId', _.uniqueId('client_'), function(){
        socket.get('clientId', function(err, clientId){
            socket.get('room', function(err, room){
                var clientData = {
                    id: clientId,
                    position: {
                        lat: -25.363882,
                        lng: 131.044922
                    },
                    isLocalClient: false
                };
                // Send to other clients in room
                socket.broadcast.to(room).emit('add:client', clientData);

                // Send to this client
                socket.emit('add:client', _.extend(clientData, {
                    isLocalClient: true
                }));
            });
        });
    });

    socket.on('disconnect:client', function () {
        // Forcefully disconnect client when client
        // closes or reloads page
        console.log('Client disconnting');
        socket.disconnect();
    });

    socket.on('disconnect', function () {
        socket.get('clientId', function(err, clientId){
            console.log('Client disconnected', err, clientId);
            socket.get('room', function(err, room){
                console.log('Notifying room of disonnection', room);
                io.sockets.in(room).emit('remove:client', {
                    id: clientId
                });
            });
        });
        totalClients =- 1;
        console.log("Client disconnected. Total Clients: ", totalClients);

    });

    socket.on('change:room', function (room) {
        console.log("Joined room", room);
        socket.join(room);
        socket.set('room', room);
    });

    socket.on('change:client', function (client) {
        console.log("client updated" ,client);
        socket.get('clientId', function(err, clientId) {

            // Only do something if the client
            // has the right to do so
            if (client.id == clientId) {
                socket.get('room', function(err, room){
                    //socket.broadcast.to(room).emit('change:latlng', dataWithClientId);
                    
                    // When the client updates are sent out, remove the isLocalClient attribute
                    // to not override it in the clients
                    if(!err){
                        io.sockets.in(room).emit('change:client', _.omit(client, 'isLocalClient')); 
                    }
                });
            }
            else { 
                console.log("The client has no right to update", client);
            }
        });
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
        //!TODO Testing Room
        uuid = "test";
        res.redirect("/map#" + uuid);
    });
}

var routes = {
    '/': createMap,
    '/map' : showMap
};

_.each(routes, function(handler, route){
    app.get(route, handler);
});

http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});
