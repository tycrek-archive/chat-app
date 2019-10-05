var fse    = require('fs-extra');
var Browserify = require('browserify');
var b = Browserify();

var Utils = this;

//var config = {};
//exports.config = () => config;

// Initialize the server
exports.init = () => {
	return new Promise((resolve, reject) => {
		fse.readJson(Utils.getPath('config.json'))
			.then((obj) => exports.config = obj)
			.then(() => resolve(Utils.config.server))
			.catch((err) => reject(err));
	});
}

// Return full path for given filename. Calls from other directories must also specify directory.
exports.getPath = (filename) => require('path').join(__dirname, filename);

// Send an Express response
// (with multiple routers, having Utils done here makes more sense)
exports.respond = (res, payload, status = 200, type = 'text') => {
	if (payload.code) status = payload.code;
	res.status(status);
	res.type(type);
	res.send(payload);
}

exports.browserify = () => {
	return new Promise((resolve, reject) => {
		Utils.config.client.files.forEach((file) => b.add(Utils.getPath(`client/${file}`)));
		//b.add(Utils.getPath('client.js'));
		b.bundle((err, buf) => {
			if (err) reject(err);
			else resolve(buf.toString());
		});
	})
}