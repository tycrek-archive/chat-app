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

exports.userCreate = (name, uuid, hash) => query(QUERIES.user.create, [name, uuid, hash]);

exports.userInfo = (useName, value) => query(QUERIES.user.info, [value], [useName ? 'name' : 'uuid']);

exports.accountList = (max = 100) => query('SELECT * FROM users LIMIT $1;', [max]);

exports.sessionCreate = (sessionId, userUuid, token) => query(QUERIES.session.create, [sessionId, userUuid, token]);

exports.sessionGet = (token) => query(QUERIES.session.get, [token]);

exports.anyQuery = (text) => query(text);

function query(text, values, array) {
	return new Promise((resolve, reject) => {
		let query = {
			text: array ? format.withArray(text, array) : text,
			values: values
		};
		pool.query(query)
			.then((result) => resolve(result.rows))
			.catch((err) => reject(err));
	});
}