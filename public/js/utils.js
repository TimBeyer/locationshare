/*
	UTILS NAMESPACE
 */
window.locationshare = (function setUpUtils (module) {

	var geolocationOptions = {
		enableHighAccuracy: true, 
		timeout: 60 * 1000, 
		maximumAge: 0 
	};

	var getPositionChangeCallback = function (successCB) {
		console.log("PositionChangeCallback created");
		return function (position) {
			console.log("geolocation: Updated position at ", position);
			var lat = position.coords.latitude;
			var lng = position.coords.longitude;

			successCB.call(successCB, {
				lat: lat,
				lng: lng
			});
		}
	};

	var getErrorCallback = function (errorCB) {
		return function (error) {
			console.log(error);
			errorCB.call(errorCB, error);
		}
	};

	// type: getCurrentPosition,watchPosition
	var createPositionRequest = function (type, successCB, errorCB) {
		if (navigator.geolocation) {
			navigator.geolocation[type].call(
				window.navigator.geolocation, // Bind this so we don't get an invocaton error
				getPositionChangeCallback(successCB), 
				getErrorCallback(errorCB),
				geolocationOptions
			);
		}
		else{
			if(error){
				errorCB.call(errorCB);
			}
		}
	};

	module.utils = {
		getRoom: function() {
			return window.location.hash.substring(1);
		},
		mapsLatLng: function (latlngObj) {
			var latlng = new google.maps.LatLng(latlngObj.lat,latlngObj.lng);
			return latlng;
		},
		getCurrentLatLng: function (successCB, errorCB) {
			createPositionRequest("getCurrentPosition", successCB, errorCB);
		},
		watchLatLng: function (updateCB, errorCB) {
			createPositionRequest("watchPosition", updateCB, errorCB);
		},

		mockLocationUpdates: function (client) {
			setInterval(function(){
				var position = client.get('position');
				var lat = position.lat + (Math.random() - 0.5) * 0.00001;
				var lng = position.lng + (Math.random() - 0.5) * 0.00001;
				var latlng = { 
					lat: lat, 
					lng: lng 
				}
				console.log("New mock location", latlng);
				module.eventBus.trigger("change:device:position", latlng);
			}, 5000);
		}
	};
	return module;
}(window.locationshare || {}));