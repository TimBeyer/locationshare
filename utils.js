var sys = require("sys");

module.exports = {
	getUUID: function(success) {
		sys.exec("uuidgen", function(err, stdout, stderr) {
		  success(stdout);
		});
	}
};