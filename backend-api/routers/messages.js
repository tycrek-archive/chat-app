var router = require('express').Router();
var Psql = require('../sql/psql');
var Crypto = require('../crypto');
var Utils = require('../utils');

router.get('/create/:senderId/:recipientId/:data/:original', (req, res) => {
	let token = req.query.token;
	let senderId = req.params.senderId;
	let recipientId = req.params.recipientId;
	let data = req.params.data;
	let original = req.params.original;

	let messageId = Crypto.generateUuid();

	Psql.messagesCreate(messageId, data, senderId, recipientId, original)
		.then(() => Utils.respond(res, Utils.config.response.success))
		.catch((err) => {
			let error = Utils.buildError(err);
			Utils.respond(res, error);
		});


	/*Psql.chatsGet(chatId)
		.then((dataset) => dataset[0])
		.then((chat) => {
			senderId = chat.sender_id;
			recipientId = chat.recipient_id;
			timestamp = Utils.utcStamp();
			messageId = Crypto.generateUuid();
		})
		.then(() => Psql.messagesCreate(messageId, chatId, data, timestamp, senderId, recipientId))
		.then(() => Utils.respond(res, Utils.config.response.success))
		.catch((err) => {
			let template = Utils.config.response.error;
			let response = Utils.buildResponse(template, { err: err });
			Utils.respond(res, response);
		});*/
});

router.get('/list/:recipientId', (req, res) => {
	let token = req.query.token;
	let recipientId = req.params.recipientId;

	let userA, userB, userInfo;
	Psql.sessionGet(token)
		.then((dataset) => dataset[0].userid)
		.then((userId) => userA = userId)

		.then(() => Psql.userInfo(false, recipientId))
		.then((dataset) => Utils.datasetFull(dataset))
		.then((dataset) => dataset[0])
		.then((mUserInfo) => {
			userInfo = mUserInfo;
			userB = mUserInfo.userid;
		})

		.then(() => Psql.messagesList(userA, userB))
		.then((messages) => {
			let template = Utils.config.response.success;
			let response = Utils.buildResponse(template, {
				messages: messages,
				recipient: userInfo
			});
			return response;
		})
		.catch((err) => Utils.buildError(err))
		.then((response) => Utils.respond(res, response));


	/*
	Psql.messagesList(chatId)
		.then((dataset) => {
			let template = Utils.config.response.success;
			let response = Utils.buildResponse(template, { messages: dataset });
			Utils.respond(res, response);
		})
		.catch((err) => {
			let template = Utils.config.response.error;
			let response = Utils.buildResponse(template, { err: err });
			Utils.respond(res, response);
		});*/
});

module.exports = router;