var router = require('express').Router();
var Psql = require('../sql/psql');
var Utils = require('../utils');

router.get('/create/:recipientName', (req, res) => {
	let token = req.query.token;
	let recipientName = req.params.recipientName;

	let userA, userB; // User UUID's
	Psql.sessionGet(token)
		.then((dataset) => dataset[0].userid)
		.then((userId) => userA = userId)

		.then(() => Psql.userInfo(true, recipientName))
		.then((dataset) => Utils.datasetFull(dataset))
		.then((dataset) => dataset[0].userid)
		.then((userId) => userB = userId)

		//.then(() => Psql.chatsExist(userA, userB))
		//.then((dataset) => Utils.datasetEmpty(dataset))

		.then(() => Psql.chatsCreate(userA, userB))
		.then(() => Psql.chatsCreate(userB, userA))

		.then(() => Utils.config.response.success)
		.catch((err) => Utils.buildError(err, Utils.config.response.error))
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

module.exports = router;
