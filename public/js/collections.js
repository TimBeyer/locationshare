/*
	COLLECTIONS NAMESPACE
 */
window.locationshare = (function setUpCollections (module) {
	module.collections = {
		Clients: Backbone.Collection.extend({
			model: locationshare.models.Client,
			initialize: function () {

			},

			getLocalClient: function () {
				return this.where({
					'isLocalClient': true
				})[0];
			}
		})
	};
	return module;
}(window.locationshare || {}));