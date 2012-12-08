/*
	VIEWS NAMESPACE
 */
window.locationshare = (function setUpViews (module) {
	module.views = {
		MapView: Backbone.View.extend({

			positionMarkers: {},

			initialize: function (options) {
				var defaultMapOptions = {
					center: new google.maps.LatLng(-25.363882,131.044922),
					zoom: 12,
					mapTypeId: google.maps.MapTypeId.ROADMAP
				};			

				this.map = new google.maps.Map(this.el, defaultMapOptions);
				
				this.clients = options.clients;
				this.clients.on('change', this.clientChanged, this);
				this.clients.on('add', this.clientAdded, this);

				_.bindAll(this, 'render', 'clientChanged', 'clientAdded', 'clientRemoved');

			},

			clientChanged: function (client, clients, options) {
				this.render();
			},

			clientAdded: function (client, clients, options) {
				var id = client.get('id');
				var position = client.get('position');
				var mapsLatLng = locationshare.utils.mapsLatLng(position);

				var marker = new google.maps.Marker({
					position: mapsLatLng,
					map: this.map,
					animation: google.maps.Animation.DROP,
					title: 'Your position'
				});
				this.positionMarkers[id] = marker;

				this.render();
			},

			clientRemoved: function (client, clients, options) {
				
			},

			render: function () {
				this.clients.each(function(client){
					var id = client.get('id');
					var position = client.get('position');
					var mapsLatLng = locationshare.utils.mapsLatLng(position);

					var marker = this.positionMarkers[id];
					marker.setPosition(mapsLatLng);

					var isLocalClient = client.get('isLocalClient');
					if(isLocalClient){
						this.map.setCenter(mapsLatLng);	
					}

				}, this);

			}

		})
	};

	return module;
}(window.locationshare || {}));

		