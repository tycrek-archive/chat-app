var fse = require('fs-extra');

module.exports = {
	// variables
	config: config,

	// functions
	init: init
}

var config = {};

function init(debug = false) {
	return new Promise((resolve, reject) => {
		if (!debug) {
			console.log('not debug mode');
			resolve();
		} else {
			console.log('debug mode');
			resolve();
		}
	});
}