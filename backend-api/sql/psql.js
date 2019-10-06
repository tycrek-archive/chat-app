var fs = require('fs-extra');
var { Pool } = require('pg');
var Format = require('pg-format');

var Utils = require('../utils');

var pool = new Pool({});

var QUERIES = {
	sessionCreate: 'session.create',
	sessionGet: 'session.get',
	userCreate: 'user.create',
	userInfo: 'user.info',
	chatsCreate: 'chats.create',
	chatsList: 'chats.list',
	chatsExist: 'chats.exist',
	messagesCreate: 'messages.create',
	messagesList: 'messages.list'
};

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
			//.then(() => _loadQueries())
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
	return query(QUERIES.userCreate, values);
}

function userInfo(useName, value) {
	return query(QUERIES.userInfo, [value], [useName ? 'username' : 'userid']);
}

function sessionCreate(sessionId, userUuid, token) {
	return query(QUERIES.sessionCreate, [sessionId, userUuid, token]);
}

function sessionGet(token) {
	return query(QUERIES.sessionGet, [token]);
}

function chatsCreate(userA, userB) {
	return query(QUERIES.chatsCreate, [userA, userB]);
}

function chatsList(userId) {
	return query(QUERIES.chatsList, [userId]);
}

function chatsExist(userA, userB) {
	return query(QUERIES.chatsExist, [userA, userB, userB, userA]);
}

function messagesCreate(messageId, data, senderId, recipientId, original) {
	return query(QUERIES.messagesCreate, [messageId, data, senderId, recipientId, original]);
}

function messagesList(userA, userB) {
	return query(QUERIES.messagesList, [userA, userB, userB, userA]);
}

function query(queryFile, values, array) {
	return new Promise((resolve, reject) => {
		fs.readFile(Utils.getPath(`sql/queries/${queryFile}.sql`))
			.then((bytes) => bytes.toString())
			.then((data) => array ? Format.withArray(data, array) : data)
			.then((text) => ({ text: text, values: values }))
			.then((query) => pool.query(query))
			.then((result) => resolve(result.rows))
			.catch((err) => reject(err));
	});
}