var router = require('express').Router();
var Psql = require('../sql/psql');
var Crypto = require('../crypto');
var Utils = require('../utils');

router.get('/create/:recipientName', (req, res) => {
	let token = req.query.token;
	let recipientName = req.params.recipientName;

	let senderId, recipientId, chatId1, chatId2;
	Psql.sessionGet(token)
		.then((dataset) => dataset[0].userid)
		.then((mSenderId) => senderId = mSenderId)

		.then(() => Psql.userInfo(true, recipientName))
		.then((dataset) => dataset[0].userid)
		.then((mRecipientId) => recipientId = mRecipientId)

		.then(() => Psql.chatsExist(senderId, recipientId))
		.then((dataset) => Utils.datasetEmpty(dataset))

		.then(() => Crypto.generateUuid())
		.then((mChatId1) => chatId1 = mChatId1)

		.then(() => Crypto.generateUuid())
		.then((mChatId2) => chatId2 = mChatId2)

		.then(() => Psql.chatsCreate(chatId1, senderId, recipientId, chatId2))
		.then(() => Psql.chatsCreate(chatId2, recipientId, senderId, chatId1))

		.then(() => Utils.buildResponse(Utils.config.response.success))
		.catch((err) => Utils.buildError(err))
		.then((response) => Utils.respond(res, response));
});

router.get('/list', (req, res) => {
	let token = req.query.token;

	Psql.sessionGet(token)
		.then((dataset) => dataset[0].userid)
		.then((userId) => Psql.chatsList(userId))
		.then((dataset) => {
			let template = Utils.config.response.success;
			let response = Utils.buildResponse(template, { chats: dataset });
			return response;
		})
		.catch((err) => Utils.buildError(err))
		.then((response) => Utils.respond(res, response));
});

router.get('/get/:senderId/:recipientId', (req, res) => {
	//TODO: implement later on
	// to add in future
	// using *Id's we get the public keys of each user
});

module.exports = router;
