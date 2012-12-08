/*
	COLLECTIONS NAMESPACE
 */
window.locationshare = (function setUpCollections (module) {
	module.collections = {
		Clients: Backbone.Collection.extend({
			model: locationshare.models.Client,
			initialize: function () {

			}
		})
	};
	return module;
}(window.locationshare || {}));