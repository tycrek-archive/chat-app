var fse = require('fs-extra');
var moment = require('moment');

var Psql = require('./sql/psql');
var Utils = this;

/**
 * Export functions for other files to access with require().
 */
exports.init = init;
exports.getPath = getPath;
exports.str2b64 = str2b64;
exports.b642str = b642str;
exports.respond = respond;
exports.utcStamp = utcStamp;
exports.tdFormat = tdFormat;
exports.validate = validate;
exports.buildNewResponse = buildNewResponse;
exports.buildResponse = buildResponse;
exports.buildError = buildError;
exports.datasetEmpty = datasetEmpty;
exports.datasetFull = datasetFull;

// Initialize the server
function init() {
	return new Promise((resolve, reject) => {
		fse.readJson(getPath('config.json'))
			.then((obj) => exports.config = obj)
			.then(() => Psql.init())
			.then(() => resolve(Utils.config.server))
			.catch((err) => reject(err));
	});
}

// Return full path for given filename. Calls from other directories must also specify directory.
function getPath(filename) {
	return require('path').join(__dirname, filename)
}

// Encode a string as Base64
function str2b64(str) {
	return Buffer.from(str).toString('base64');
}

// Decode Base64 data into a string
function b642str(b64) {
	return Buffer.from(b64, 'base64').toString();
}

// Send an Express response
// (with multiple routers, having Utils done here makes more sense)
function respond(res, payload, status = 200, type = 'json') {
	if (payload.code) status = payload.code;
	res.status(status);
	res.type(type);
	res.send(payload);
}

// Return the current UTC timestamp in Unix format
function utcStamp() {
	return moment.utc().format('x');
}

// Convert the provided timestamp into Unix format as UTC time
function tdFormat(td, f = 'x') {
	return moment(td, f).utc().format(f);
}

// Validate if a token is permitted to access the requested resource
function validate(req) {
	return new Promise((resolve, reject) => {
		let path = req.path;
		let token = req.query.token;

		if (_isPublicRoute(path)) return resolve();
		if (token == null || token.length == 0) return reject(Utils.config.response.unauthorized);

		Psql.sessionGet(token)
			.then((dataset) => {
				if (dataset.length > 0) return dataset[0];
				else throw Utils.config.response.unauthorized;
			})
			.then((session) => {
				let now = Utils.utcStamp();
				let expiry = Utils.tdFormat(session.expiry, 'x');
				if (expiry > now) return session.userid;
				else throw Utils.config.response.forbidden;
			})
			.then((uuid) => Psql.userInfo(false, uuid))
			.then((dataset) => {
				if (dataset.length > 0) return dataset[0];
				else throw Utils.config.response.unauthorized;
			})
			.then((user) => {
				return;
				if (user.name === 'admin') return;
				else throw Utils.config.response.forbidden;
			})
			.then(() => resolve())
			.catch((err) => {
				err = err.code == null ? Utils.buildNewResponse(500, '500', { err: err }) : err;
				reject(err);
			});
	});

	function _isPublicRoute(path) {
		let routes = Utils.config.publicRoutes;
		for (i = 0; i < routes.length; i++) {
			route = routes[i];
			if (path === '/' || path.includes(route)) return true;
		}
		return false;
	}
}

// Build a JSON response object to send to clients
function buildNewResponse(code, reason, data = {}) {
	let response = {
		code: code,
		reason: reason,
		data: data
	};

	return response;
}

function buildResponse(response, data = {}) {
	response.data = data;
	return response;
}

function buildError(err, response = Utils.config.response.error) {
	console.log(err);
	let tmp = JSON.stringify(err, Object.getOwnPropertyNames(err));
	response.data = tmp;
	return response;
}

function datasetEmpty(dataset) {
	return new Promise((resolve, reject) => dataset.length == 0 ? resolve(dataset) : reject('Dataset empty'));
}

function datasetFull(dataset) {
	return new Promise((resolve, reject) => dataset.length == 0 ? reject('Dataset full') : resolve(dataset));
}