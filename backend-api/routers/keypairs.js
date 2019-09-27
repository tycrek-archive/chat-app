var router = require('express').Router();
var Psql = require('../sql/psql');
var Utils = require('../utils');
var crypto = require('../crypto');

router.get('/public/:toUser', (req, res) => {
	let toUser = req.params.toUser;
	Psql.userInfo(true, toUser)
		.then((dataset) => {
			if (dataset.length > 0) return dataset[0];
			else throw Utils.config.response.error;
		})
		.then((user) => user.uuid)
		.then((uuid) => Psql.keypairsGet(false, uuid))
		.then((dataset) => {
			let key = dataset[0].pubkey;
			let template = Utils.config.response.success;
			let response = Utils.buildResponse(template, { pubKey: key });
			Utils.respond(res, response);
		})
		.catch((err) => Utils.respond(res, err));
});

router.get('/private', (req, res) => {
	let token = req.query.token;
	Psql.sessionGet(token)
		.then((dataset) => {
			if (dataset.length > 0) return dataset[0];
			else throw Utils.config.response.error;
		})
		.then((session) => session.userid)
		.then((uuid) => Psql.keypairsGet(true, uuid))
		.then((dataset) => {
			let key = dataset[0].privkey;
			let template = Utils.config.response.success;
			let response = Utils.buildResponse(template, { privKey: key });
			Utils.respond(res, response);
		})
		.catch((err) => Utils.respond(res, err));
});

module.exports = router;