(function(){
	var locationshare = {
		utils: {
			getRoom: function(){
				//return window.location.hash.substring(1);
				return "test"; //mock room for testing
			},
			mapsLatLng: function(latlngObj){
				var latlng = new google.maps.LatLng(latlngObj.lat,latlngObj.lng);
				return latlng;
			},
			getCurrentLatLng: function(successCB, errorCB){
				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(
						function(position){
							//console.log(position);
							var lat = position.coords.latitude;
							var lng = position.coords.longitude;

							//console.log(lat,lng);
							//var latlng = new google.maps.LatLng(lat,lng);
							successCB({
								lat: lat,
								lng: lng
							});
						}, 
						function(error){
							console.log(error);
							errorCB();
						},
						{
							enableHighAccuracy: true, 
							timeout: 60 * 1000, 
							maximumAge: 0 
						}
					);
				}
				else{
					if(errorCB) {
						errorCB();
					}
				}
			},
			watchLatLng: function(updateCB, errorCB){
				if (navigator.geolocation) {
					navigator.geolocation.watchPosition(
						function(position){
							//console.log(position);
							var lat = position.coords.latitude;
							var lng = position.coords.longitude;

							//console.log(lat,lng);
							//var latlng = new google.maps.LatLng(lat,lng);
							updateCB({
								lat: lat,
								lng: lng
							});
						}, 
						function(error){
							console.log(error);
							errorCB();
						},
						{
							enableHighAccuracy: true, 
							timeout: 60 * 1000, 
							maximumAge: 0 
						}
					);
				}
				else{
					if(errorCB) {
						errorCB();
					}				}
			}
		},
		models: {
			Client: Backbone.Model.extend({
				initialize: function () {

				}
			})
		},
		collections: {
			Clients: Backbone.Collection.extend({
				model: locationshare.models.Client,
				initialize: function () {

				}
			})
		},
		views: {
			MapView: Backbone.View.extend({
				initialize: function (options) {
					var defaultMapOptions = {
						center: new google.maps.LatLng(-25.363882,131.044922),
						zoom: 12,
						mapTypeId: google.maps.MapTypeId.ROADMAP
					};			

					this.map = new google.maps.Map(this.el, defaultMapOptions);
					
					this.clients = options.clients;
					this.clients.on('change', this.clientChanged);
					this.clients.on('add', this.clientAdded);

					_.bindAll(this, this.render, this.clientChanged, this.clientAdded, this.clientRemoved);

				},

				clientChanged: function (client, clients, options) {

				},

				clientAdded: function (client, clients, options) {

				},

				clientRemoved: function (client, clients, options) {

				},

				render: function (changes) {

				}

			})
		},
		
		eventBus: _.extend({}, Backbone.Events)
	}


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

		var clients = {};

		var socket = io.connect('http://192.168.178.22:3030');

		var mapView = new locationshare.views.MapView({
			el: document.getElementById("map_canvas")
		});

		// Join the map channel
		socket.emit('change:room', locationshare.utils.getRoom());
		// Remove the hash so the url isn't so ugly
		//window.location.hash = "";

		socket.on('change:latlng', function (data) {
			console.log(data);
			//socket.emit('my other event', { my: 'data' });
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
/*		google.maps.event.addListenerOnce(map, 'tilesloaded', function(){

			// Get fist time position
			locationshare.utils.getCurrentLatLng(function(latlng){
				console.log("Initialized position at: ", latlng);
				var mapsLatLng = locationshare.utils.mapsLatLng(latlng);
				map.setCenter(mapsLatLng);
				myPositionMarker = new google.maps.Marker({
					position: mapsLatLng,
					map: map,
					animation: google.maps.Animation.DROP,
					title: 'Your position'
				});
			});

			// Monitor your position and send it to the server
			locationshare.utils.watchLatLng(function(latlng){
				locationshare.eventBus.trigger("change:latlng", latlng);
			});
		});
		
		// Update UI
		locationshare.eventBus.on("change:latlng", function(latlng){
			console.log("Updated position: ", latlng);
			myPosition = latlng;
			var myPositionLatLng = locationshare.utils.mapsLatLng(latlng);
			map.setCenter(myPositionLatLng);
			myPositionMarker.setPosition(myPositionLatLng);
		});
*/
		// Update server
		locationshare.eventBus.on("change:latlng", function(latlng){
			socket.emit("change:latlng", latlng);
		});

		// Mock location updates
		setInterval(function(){
			var lat = myPosition.lat + Math.random() * 0.00001;
			var lng = myPosition.lng + Math.random() * 0.00001;
			var latlng = { 
				lat: lat, 
				lng: lng 
			}
			locationshare.eventBus.trigger("change:latlng", latlng);
		},1000);
	});
}())
