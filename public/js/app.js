
(function(){

	$(function () {
		var myClientId
		var myPositionMarker;
		var myPosition;

		var socket = io.connect('http://192.168.178.22:3030');

		window.addEventListener('beforeunload', function () {
			console.log("Closing page, disconnecting");
			socket.emit('disconnect:client');
		});
		var clients = new locationshare.collections.Clients();

		var mapView = new locationshare.views.MapView({
			el: document.getElementById("map_canvas"),
			clients: clients
		});

		// Join the map channel
		socket.emit('change:room', locationshare.utils.getRoom());;

		socket.on('change:client', function (serializedClient) {
			console.log("Change client: ", serializedClient);
			
			var client = clients.get(serializedClient.id);
			// Update with client's attributes
			client.set(serializedClient);
		});

		socket.on('add:client', function (serializedClient) {
			console.log("New client connected: ", serializedClient);
			var clientModel = new locationshare.models.Client(serializedClient);
			clients.add(clientModel);
			if(clientModel.get('isLocalClient')){
				locationshare.eventBus.trigger("available:localClient");
			}
		});

		socket.on('remove:client', function (serializedClient) {
			console.log("Client disconnected: ", serializedClient);
			var clientModel = clients.get(serializedClient.id);
			clients.remove(clientModel);
		});

		/*
			Trigger the initialization once the map is loaded
		 */
		google.maps.event.addListenerOnce(mapView.map, 'tilesloaded', function(){

			// Get fist time position
			locationshare.utils.getCurrentLatLng(function(position){
				console.log("device: Initialized position at: ", position);
				locationshare.eventBus.trigger("change:device:position", position);

			});

			// Monitor your position and send it to the server
			locationshare.utils.watchLatLng(function(position){
				console.log("device: Triggering updated position ", position);
				locationshare.eventBus.trigger("change:device:position", position);

			});

		});
		
		locationshare.eventBus.on("available:localClient", function () {
			// Update server
			locationshare.eventBus.on("change:device:position", function (position) {
				var localClient = clients.getLocalClient();
				localClient.set("position", position);
				var serializedClient = localClient.toJSON();

				console.log("Change device position", position, serializedClient);
				socket.emit("change:client", serializedClient);
			});

			var localClient = clients.getLocalClient();
			// Mock location updates
			locationshare.utils.mockLocationUpdates(localClient);

		});

		
	});
}())
