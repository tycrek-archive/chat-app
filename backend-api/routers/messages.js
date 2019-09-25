var router = require('express').Router();
var Psql = require('../sql/psql');
var Crypto = require('../crypto');
var Utils = require('../utils');

router.get('/create/:chatId/:data', (req, res) => {
	let token = req.query.token;
	let chatId = req.params.chatId;
	let data = req.params.data;

	let messageId, timestamp, senderId, recipientId;
	Psql.chatsGet(chatId)
		.then((dataset) => dataset[0])
		.then((chat) => {
			senderId = chat.sender_id;
			recipientId = chat.recipient_id;
			timestamp = Utils.utcStamp();
			messageId = Crypto.generateUuid();
		})
		.then(() => Psql.messagesCreate(messageId, chatId, data, timestamp, senderId, recipientId))
		.then(() => Utils.respond(res, Utils.config().response.success))
		.catch((err) => {
			let template = Utils.config().response.error;
			let response = Utils.buildResponse(template, { err: err });
			Utils.respond(res, response);
		});
});

router.get('/list/:chatId', (req, res) => {
	let token = req.query.token;
	let chatId = req.params.chatId

	Psql.messagesList(chatId)
		.then((dataset) => {
			let template = Utils.config().response.success;
			let response = Utils.buildResponse(template, { messages: dataset });
			Utils.respond(res, response);
		})
		.catch((err) => {
			let template = Utils.config().response.error;
			let response = Utils.buildResponse(template, { err: err });
			Utils.send(res, response);
		});
});

module.exports = router;