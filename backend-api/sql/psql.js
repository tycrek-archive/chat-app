var utils = require('../utils');
var fse = require('fs-extra');
const { Pool, Client } = require('pg');

var pool;
var QUERIES = {};

exports.init = () => {
	return new Promise((resolve, reject) => {
		_connect().then(() => {
			_loadQueries().then(() => {
				resolve();
			}).catch((err) => reject(err));
		}).catch((err) => reject(err));
	});

	function _connect() {
		return new Promise((resolve, reject) => {
			fse.readJson(utils.getPath('sql/auth.json'), (err, obj) => {
				if (err) return reject(err);
				pool = new Pool({
					connectionString: obj.connectionString
				});
				resolve();
			});
		});
	}

	function _loadQueries() {
		return new Promise((resolve, reject) => {
			let total = 0;
			let count = 0;

			_iterateQueries(resolve, reject, _incrementTotal);
			_iterateQueries(resolve, reject, _readQuery);

			function _iterateQueries(resolve, reject, task) {
				let queries = utils.config().queries;
				queries.segments.forEach((segment) => {
					Object.keys(queries[segment]).forEach((key) => {
						let value = queries[segment][key];
						task(segment, key, value, resolve, reject);
					});
				});
			}

			function _incrementTotal() {
				total++;
			}

			function _readQuery(segment, key, value, resolve, reject) {
				let sqlPath = 'sql/queries/';
				let fullPath = sqlPath + value;

				fse.readFile(utils.getPath(fullPath), (err, data) => {
					if (err) return reject(err);
					if (!QUERIES.hasOwnProperty(segment)) QUERIES[segment] = {};
					QUERIES[segment][key] = data.toString();
					count++;
					if (count === total) resolve();
				});
			}
		});
	}
}

exports.createUser = (name, uuid, hash) => {
	return new Promise((resolve, reject) => {
		fse.readFile(utils.getPath('sql/queries/createUser.sql'), (err, data) => {
			if (err) return reject(err);
			let query = {
				text: data.toString(),
				values: [name, uuid, hash]
			};
			pool.query(query).then(() => {
				resolve();
			}).catch((err) => reject(err));
		});
	});
}

exports.getHash = (name) => {
	return new Promise((resolve, reject) => {
		let query = {
			text: 'SELECT hash FROM users WHERE name LIKE $1;',
			values: [name]
		};
		pool.query(query).then((res) => {
			resolve(res.rows[0]);
		}).catch((err) => reject(err));
	});
}

exports.getAccountUuid = (name) => {
	return new Promise((resolve, reject) => {
		let query = {
			text: 'SELECT uuid FROM users WHERE name LIKE $1;',
			values: [name]
		};
		pool.query(query).then((res) => {
			resolve(res.rows[0]);
		}).catch((err) => reject(err));
	});
}

exports.accountList = (max = 100) => {
	return new Promise((resolve, reject) => {
		let query = {
			text: 'SELECT * FROM users LIMIT $1;',
			values: [max]
		};
		pool.query(query).then((res) => {
			resolve(res.rows);
		}).catch((err) => reject(err));
	});
}

//TODO: getHash must use UUID
//TODO: unique values on sql
//TODO: check if sql succeeded
//TODO: get account from name or uuid (whole object)