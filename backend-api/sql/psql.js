var Utils = require('../utils');
var fse = require('fs-extra');
const { Pool, Client } = require('pg');
var format = require('pg-format');

var pool = new Pool({});
var QUERIES = {};

// Initialize connection pool and read queries into RAM
exports.init = () => {
	return new Promise((resolve, reject) => {
		fse.readJson(Utils.getPath('sql/auth.json'))
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

				fse.readFile(Utils.getPath(fullPath))
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

exports.userCreate = (values) => query(QUERIES.user.create, values);

exports.userInfo = (useName, value) => query(QUERIES.user.info, [value], [useName ? 'username' : 'userid']);

exports.sessionCreate = (sessionId, userUuid, token) => query(QUERIES.session.create, [sessionId, userUuid, token]);

exports.sessionGet = (token) => query(QUERIES.session.get, [token]);

exports.anyQuery = (text) => query(text);

exports.keypairsCreate = (uuid, pubKey, privKey) => query(QUERIES.keypairs.create, [uuid, pubKey, privKey]);

exports.keypairsGet = (getPrivate, uuid) => query(QUERIES.keypairs.get, [uuid], [getPrivate ? 'privkey' : 'pubkey']);

exports.chatsCreate = (chatId, senderId, recipientId, partnerId) => query(QUERIES.chats.create, [chatId, senderId, recipientId, partnerId]);

exports.chatsList = (userId) => query(QUERIES.chats.list, [userId]);

exports.chatsGet = (chatId) => query(QUERIES.chats.get, [chatId]);

exports.chatsExist = (senderId, recipientId) => query(QUERIES.chats.exist, [senderId, recipientId]);

exports.messagesCreate = (messageId, chatId, data, timestamp, senderId, recipientId) => query(QUERIES.messages.create, [messageId, chatId, data, /*timestamp,*/ senderId, recipientId]);

exports.messagesList = (chatId) => query(QUERIES.messages.list, [chatId]);

exports.messagesGet = (messageId) => query(QUERIES.messages.get, [messageId]);

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