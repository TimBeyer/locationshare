/*
	INTIALIZATION LOCATIONSHARE
*/
window.locationshare = (function setUpModule (module) {

	// Add module eventBus
	module.eventBus = _.extend({}, Backbone.Events);

	return module;
}(window.locationshare || {}));