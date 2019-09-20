var fse = require('fs-extra');
var uuidv4 = require('uuid/v4');
var crypto = require('crypto');
var bcrypt = require('bcrypt');
var moment = require('moment');


var Psql = require('./sql/psql');
var utils = this;

var config = {};
exports.config = () => config;

// Initialize the server (read configs and connect to SQL)
exports.init = () => {
	return new Promise((resolve, reject) => {
		_readConfig()
			.then(() => _connectSql())
			.then(() => resolve())
			.catch((err) => reject(err));
	});

	function _readConfig() {
		return new Promise((resolve, reject) => fse.readJson(utils.getPath('config.json'), (err, data) => err ? reject(err) : (config = data, resolve())));
	}

	function _connectSql() {
		return new Promise((resolve, reject) => {
			Psql.init()
				.then(() => resolve())
				.catch((err) => reject(err));
		});
	}
}

exports.getPath = (filename) => {
	return require('path').join(__dirname, filename);
}

exports.str2b64 = (str) => Buffer.from(str).toString('base64');
exports.b642str = (str) => Buffer.from(str, 'base64').toString();

exports.generateUuid = () => uuidv4();

exports.generateToken = (length = 32) => crypto.randomBytes(length).toString('hex');

exports.generateHash = (password) => {
	return new Promise((resolve, reject) => {
		bcrypt.genSalt(this.config().saltRounds, (err, salt) => {
			err ? reject(err) : bcrypt.hash(password, salt, (err, hash) => {
				err ? reject(err) : resolve(hash);
			});
		});
	});
}

exports.comparePassHash = (password, hash) => {
	return new Promise((resolve, reject) => {
		bcrypt.compare(password, hash, (err, same) => {
			err ? reject(err) : resolve(same);
		});
	});
}

exports.passwordMeetsRequirements = (password) => {
	let MIN_LENGTH = 12;
	let MIN_EACH   = 2;
	let LOWER      = new RegExp(/([a-z])/g);
	let UPPER      = new RegExp(/[A-Z]/g);
	let NUMBER     = new RegExp(/[0-9]/g);
	let SYMBOL     = new RegExp(/[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g);

	if (
		password.length >= MIN_LENGTH &&
		password.match(LOWER).length >= MIN_EACH &&
		password.match(UPPER).length >= MIN_EACH &&
		password.match(NUMBER).length >= MIN_EACH &&
		password.match(SYMBOL).length >= MIN_EACH
	) return true;
	else return false;
}

// sends an express respnse.
// with multiple routers, utils makes more sense
exports.respond = (res, payload, status = 200, type = 'json') => {
	res.status(status);
	res.type(type);
	res.send(payload);
}

exports.utcStamp = () => moment.utc().format('x');
exports.tdFormat = (td, f) => moment(td, f).utc().format(f);

exports.validate = (req) => {
	return new Promise((resolve, reject) => {
		let path = req.path;
		let token = req.query.token;

		if (_isPublicRoute(path)) return resolve();
		if (token == null) return reject('401::Unauthorized');

		Psql.sessionGet(token).then((dataset) => {
			if (dataset.length === 0) reject();
			else {
				let now = utils.utcStamp();
				let expiry = utils.tdFormat(dataset[0].expiry, 'x');
				if (expiry > now) resolve();
				else reject('403::Forbidden');
			}
		})
	});

	function _isPublicRoute(path) {
		let routes = utils.config().publicRoutes;
		for (i = 0; i < routes.length; i++) {
			route = routes[i];
			if (path === '/' || path.includes(route)) return true;
		}
		return false;
	}
}