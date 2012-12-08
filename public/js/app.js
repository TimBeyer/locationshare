
(function(){
	/*
		Events interface structure:

		Backbone-like event name structure
		change:clients:12 -> client {
			changed attributes
		}

		add:clients:14 -> client {
			new client atributes
		}

		change:clients:12:location -> locationData for: id=12 {
			lat
			lon
		} 

		
	 */

	$(function () {
		var myClientId
		var myPositionMarker;
		var myPosition;

		var socket = io.connect('http://192.168.178.22:3030');

		var clients = new locationshare.collections.Clients();

		var mapView = new locationshare.views.MapView({
			el: document.getElementById("map_canvas"),
			clients: clients
		});

		// Join the map channel
		socket.emit('change:room', locationshare.utils.getRoom());;

		socket.on('change:latlng', function (data) {
			console.log(data);
		});

		socket.on('change:clientId', function (clientId) {
			console.log("New clientId: ", clientId);
			myClientId = clientId;
		});

		socket.on('add:client', function (clientId) {
			console.log("New client connected: ", clientId);
			clients[clientId] = {
				clientId: clientId
			}
		});

		/*
			Trigger the initialization once the map is loaded
		 */
		google.maps.event.addListenerOnce(mapView.map, 'tilesloaded', function(){

			// Get fist time position
			locationshare.utils.getCurrentLatLng(function(latlng){
				console.log("Initialized position at: ", latlng);
				locationshare.eventBus.trigger("change:latlng", latlng);

			});

			// Monitor your position and send it to the server
			locationshare.utils.watchLatLng(function(latlng){
				console.log("eventBus: Triggering updated position ", latlng);
				locationshare.eventBus.trigger("change:latlng", latlng);

			});


			// Mock location updates
			locationshare.utils.mockLocationUpdates();
		});
		
		// Update server
		locationshare.eventBus.on("change:latlng", function(latlng){
			myPosition = latlng;
			socket.emit("change:latlng", latlng);
		});

		
	});
}())
