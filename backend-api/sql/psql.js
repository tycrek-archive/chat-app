var utils = require('../utils');
var fse = require('fs-extra');
const { Pool, Client } = require('pg');
var format = require('pg-format');

var pool;
var QUERIES = {};

// Initialize connection pool and read queries into RAM
exports.init = () => {
	return new Promise((resolve, reject) => {
		_connect()
			.then(() => _loadQueries())
			.then(() => resolve())
			.catch((err) => reject(err));
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

				fse.readFile(utils.getPath(fullPath), (err, data) => {
					if (err) return reject(err);
					if (!QUERIES.hasOwnProperty(category)) QUERIES[category] = {};

					QUERIES[category][command] = data.toString();
					count++;
					if (count === total) resolve();
				});
			}
		});
	}

	// Reads query files into RAM. Query file names
	// are listed in config.json as a nested object.
	// Files are read asynchronously, but it is
	// technically "blocking" since the promise is
	// not resolved until all files are read. This
	// is simply to help speed up loading times on
	// a multithreaded server. Hopefully.
	//
	// Since we have to iterate twice (once to get
	// total number and another to read the files),
	// we pass functions into a single iterator.
	function _loadQueriesOld() {
		return new Promise((resolve, reject) => {
			let total = 0;
			let count = 0;

			_iterateQueries(resolve, reject, _incrementTotal);
			_iterateQueries(resolve, reject, _readQuery);

			// Iterate over the query keys defined in config.json
			// and run the necessary task (a function).
			function _iterateQueries(resolve, reject, task) {
				let queries = utils.config().queries;
				queries.segments.forEach((segment) => {
					Object.keys(queries[segment]).forEach((key) => {
						let value = queries[segment][key];
						task(segment, key, value, resolve, reject);
					});
				});
			}

			// Runs before reading files.
			// This lets us know when all files have been read.
			function _incrementTotal() {
				total++;
			}

			// Read the query file
			function _readQuery(segment, key, value, resolve, reject) {
				let fullPath = 'sql/queries/' + value;

				// Asynchronously read the file. Once the file
				// has been read, we increase the counter that
				// indicates how many have been read. Then we
				// check if the counter is the same as the total,
				// and we resolve our function.
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

exports.userInfo = (mode, value) => {
	return new Promise((resolve, reject) => {
		let column = mode !== 'NAME' ? 'uuid' : 'name';
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