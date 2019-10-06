var fs = require('fs-extra');
var { Pool } = require('pg');
var format = require('pg-format');

var Utils = require('../utils');

var pool = new Pool({});
var QUERIES = {};

module.exports = {
	init: init,
	userCreate: userCreate,
	userInfo: userInfo,
	sessionCreate: sessionCreate,
	sessionGet: sessionGet,
	chatsCreate: chatsCreate,
	chatsList: chatsList,
	chatsExist: chatsExist,
	messagesCreate: messagesCreate,
	messagesList: messagesList
};

// Initialize connection pool and read queries into RAM
function init() {
	return new Promise((resolve, reject) => {
		fs.readJson(Utils.getPath('sql/auth.json'))
			.then((obj) => pool = new Pool(obj))
			.then(() => _loadQueries())
			.then(() => resolve())
			.catch((err) => reject(err));
	});

	function _loadQueries() {
		return new Promise((resolve, reject) => {
			let total = Utils.config.qs.length;
			let count = 0;

			Utils.config.qs.forEach((query) => {
				let category = query.split('.')[0];
				let command = query.split('.')[1];

				_readQuery(category, command, resolve, reject);
			});

			// Read the query file
			function _readQuery(category, command, resolve, reject) {
				let fullPath = `sql/queries/${category}.${command}.sql`;

				fs.readFile(Utils.getPath(fullPath))
					.then((bytes) => {
						if (!QUERIES.hasOwnProperty(category)) QUERIES[category] = {};

						QUERIES[category][command] = bytes.toString();
						(count++ , count === total) && resolve();
					})
					.catch((err) => reject(err));
			}
		});
	}
}

function userCreate(values) {
	query(QUERIES.user.create, values);
}
function userInfo(useName, value) {
	query(QUERIES.user.info, [value], [useName ? 'username' : 'userid']);
}

function sessionCreate(sessionId, userUuid, token) {
	query(QUERIES.session.create, [sessionId, userUuid, token]);
}
function sessionGet(token) {
	query(QUERIES.session.get, [token]);
}

function chatsCreate(userA, userB) {
	query(QUERIES.chats.create, [userA, userB]);
}
function chatsList(userId) {
	query(QUERIES.chats.list, [userId]);
}
function chatsExist(userA, userB) {
	query(QUERIES.chats.exist, [userA, userB, userB, userA]);
}

function messagesCreate(messageId, data, senderId, recipientId, original) {
	query(QUERIES.messages.create, [messageId, data, senderId, recipientId, original]);
}
function messagesList(userA, userB) {
	query(QUERIES.messages.list, [userA, userB, userB, userA]);
}

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