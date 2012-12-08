/*
	VIEWS NAMESPACE
 */
window.locationshare = (function setUpViews (module) {
	module.views = {
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

				_.bindAll(this, 'render', 'clientChanged', 'clientAdded', 'clientRemoved');

			},

			clientChanged: function (client, clients, options) {

			},

			clientAdded: function (client, clients, options) {

			},

			clientRemoved: function (client, clients, options) {

			},

			render: function (changes) {
				var mapsLatLng = locationshare.utils.mapsLatLng(latlng);
				map.setCenter(mapsLatLng);
				myPositionMarker = new google.maps.Marker({
					position: mapsLatLng,
					map: map,
					animation: google.maps.Animation.DROP,
					title: 'Your position'
				});

			}

		})
	};

	return module;
}(window.locationshare || {}));

		