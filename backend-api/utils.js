var fse = require('fs-extra');
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