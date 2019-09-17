var fse = require('fs-extra');
var uuidv4 = require('uuid/v4');
var crypto = require('crypto');
var bcrypt = require('bcrypt');


var psql = require('./sql/psql');
var utils = this;

var config = {};

exports.config = () => {
	return config;
};

exports.init = () => {
	return new Promise((resolve, reject) => {
		_readConfig().then(() => {
			_connectSql().then(() => {
				require('./tests').test();
				resolve();
			}).catch((err) => reject(err));
		}).catch((err) => reject(err));
	});

	function _readConfig() {
		return new Promise((resolve, reject) => {
			fse.readFile(utils.getPath('config.json'), (err, data) => {
				if (err) reject(err);
				else {
					config = JSON.parse(data.toString());
					resolve();
				}
			});
		});
	}
	function _connectSql() {
		return new Promise((resolve, reject) => {
			psql.init().then(() => {
				resolve();
			}).catch((err) => reject(err));
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