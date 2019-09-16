var fse = require('fs-extra');

var config = {};

exports.config = () => {
	return config;
};

exports.init = () => {
	return new Promise((resolve, reject) => {
		_readConfig().then(() => {
			_connectSql().then(() => {
				require('./tests');
				resolve();
			}).catch((err) => reject(err));
		}).catch((err) => reject(err));
	});

	function _readConfig() {
		return new Promise((resolve, reject) => {
			fse.readFile(getPath('config.json'), (err, data) => {
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
			resolve();
		});
	}
}

function getPath(filename) {
	return require('path').join(__dirname, filename);
}