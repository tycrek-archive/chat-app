var router = require('express').Router();
var Psql = require('../sql/psql');
var Crypto = require('../crypto');
var Utils = require('../utils');

router.get('/create/:recipientName', (req, res) => {
	let token = req.query.token;
	let recipientName = req.params.recipientName;

	let chatId, senderId, recipientId;
	Psql.sessionGet(token)
		.then((dataset) => dataset[0].user_uuid)
		.then((mSenderId) => senderId = mSenderId)
		.then(() => Psql.userInfo(true, recipientName))
		.then((dataset) => dataset[0].uuid)
		.then((mRecipientId) => recipientId = mRecipientId)
		.then(() => Crypto.generateUuid())
		.then((mChatId) => chatId = mChatId)
		.then(() => Psql.chatsCreate(chatId, senderId, recipientId))
		.then(() => {
			let template = Utils.config.response.success;
			let response = Utils.buildResponse(template, { chatId: chatId });
			Utils.respond(res, response);
		})
		.catch((err) => Utils.respond(res, err));
});

router.get('/list', (req, res) => {
	let token = req.query.token;

	Psql.sessionGet(token)
		.then((dataset) => dataset[0].user_uuid)
		.then((userId) => Psql.chatsList(userId))
		.then((dataset) => {
			let template = Utils.config.response.success;
			let response = Utils.buildResponse(template, { chats: dataset });
			Utils.respond(res, response);
		})
		.catch((err) => Utils.respond(res, err));
});

module.exports = router;
