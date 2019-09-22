var utils = require('../utils');
var fse = require('fs-extra');
const { Pool, Client } = require('pg');
var format = require('pg-format');

var pool = new Pool();
var QUERIES = {};

// Initialize connection pool and read queries into RAM
exports.init = () => {
	return new Promise((resolve, reject) => {
		fse.readJson(utils.getPath('sql/auth.json'))
			.then((obj) => pool = new Pool(obj))
			.then(() => _loadQueries())
			.then(() => resolve())
			.catch((err) => reject(err));
	});

	function _loadQueries() {
		return new Promise((resolve, reject) => {
			let total = utils.config().qs.length;
			let count = 0;

			utils.config().qs.forEach((query) => {
				let category = query.split('.')[0];
				let command = query.split('.')[1];

				_readQuery(category, command, resolve, reject);
			});

			// Read the query file
			function _readQuery(category, command, resolve, reject) {
				let fullPath = `sql/queries/${category}.${command}.sql`;

				fse.readFile(utils.getPath(fullPath))
					.then((bytes) => {
						if (!QUERIES.hasOwnProperty(category)) QUERIES[category] = {};
	
						QUERIES[category][command] = bytes.toString();
						(count++, count === total) && resolve();
					})
					.catch((err) => reject(err));
			}
		});
	}
}

exports.userCreate = (name, uuid, hash) => {
	return new Promise((resolve, reject) => {
		let query = {
			text: QUERIES.user.create,
			values: [name, uuid, hash]
		};
		pool.query(query).then(() => {
			resolve();
		}).catch((err) => reject(err));
	});
}

exports.userInfo = (useName, value) => {
	return new Promise((resolve, reject) => {
		let column = useName ? 'name' : 'uuid';
		let query = {
			text: format(QUERIES.user.info, column),
			values: [value]
		};
		pool.query(query).then((res) => {
			resolve(res.rows);
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

exports.sessionCreate = (session_id, user_uuid, token) => {
	return new Promise((resolve, reject) => {
		let query = {
			text: QUERIES.session.create,
			values: [session_id, user_uuid, token]
		}
		pool.query(query).then(() => {
			resolve();
		}).catch((err) => reject(err));
	});
}

exports.sessionGet = (token) => {
	return new Promise((resolve, reject) => {
		let query = {
			text: QUERIES.session.get,
			values: [token]
		};
		pool.query(query).then((res) => {
			resolve(res.rows);
		}).catch((err) => reject(err));
	});
}

exports.query = (query) => {
	return new Promise((resolve, reject) => {
		pool.query(query).then((res) => resolve(res.rows)).catch((err) => reject(err));
	});
}

function runQuery(text, values) {
	return new Promise((resolve, reject) => {
		let query = {
			text: text,
			values: values
		};
		pool.query(query)
			.then((result) => resolve(result.rows))
			.catch((err) => reject(err));
	});
}