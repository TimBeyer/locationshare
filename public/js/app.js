(function(){
	var locationshare = {
		utils: {
			getCurrentLatLng: function(successCB, errorCB){
				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(
						function(position){
							//console.log(position);
							var lat = position.coords.latitude;
							var lng = position.coords.longitude;

							//console.log(lat,lng);
							var latlng = new google.maps.LatLng(lat,lng);
							successCB(latlng);
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
					errorCB();
				}
			}
		}
	}



	$(function(){

		var socket = io.connect('http://141.64.170.122:3030');
		var mapOptions = {
			center: new google.maps.LatLng(-25.363882,131.044922),
			zoom: 12,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

		socket.on('location_update', function (data) {
			console.log(data);
			//socket.emit('my other event', { my: 'data' });
		});
		/*
			Trigger the initialization once the map is loaded
		 */
		google.maps.event.addListenerOnce(map, 'tilesloaded', function(){
			locationshare.utils.getCurrentLatLng(function(latlng){
				map.setCenter(latlng);
				var marker = new google.maps.Marker({
					position: latlng,
					map: map,
					animation: google.maps.Animation.DROP,
					title: 'Your position'
				});
			});
		});
		
		
	});
}())
