var router = require('express').Router();
var Psql = require('../sql/psql');
var utils = require('../utils');
var crypto = require('../crypto');

// Create a new user
router.get('/create/:name/:pass', (req, res) => {
	let name = req.params.name;
	let pass = utils.b642str(req.params.pass);
	let uuid = crypto.generateUuid();

	let errorResponse = utils.config().response.loginFailed;

	if (crypto.passwordMeetsRequirements(pass)) {
		Psql.userInfo(true, name)
			.then((dataset) => {
				if (dataset.length < 1) return;
				else throw errorResponse;
			})
			.then(() => crypto.generateHash(pass))
			.then((hash) => Psql.userCreate(name, uuid, hash))
			.then(() => crypto.generateKeyPair(pass))
			.then(([pubKey, privKey]) => Psql.keypairsCreate(uuid, pubKey, privKey))
			.then(() => utils.respond(res, utils.config().response.success))
			.catch((err) => {
				if (err == errorResponse) utils.respond(res, errorResponse);
				else utils.respond(res, utils.buildResponse(errorResponse, { err: err.toString() }));
			});
	} else {
		utils.respond(res, errorResponse);
	}
});

// Validate a username/password and respond with a token
router.get('/login/:username/:password', (req, res) => {
	let username = req.params.username;
	let password = utils.b642str(req.params.password);

	const loginError = utils.config().response.loginFailed;

	let userUuid, sessionId, token;
	Psql.userInfo(true, username)
		.then((dataset) => {
			if (dataset.length > 0) return dataset[0];
			else throw loginError;
		})
		.then((userInfo) => {
			userUuid = userInfo.uuid;
			sessionId = crypto.generateUuid();
			token = crypto.generateToken();
			return crypto.comparePassHash(password, userInfo.hash);
		})
		.then((same) => {
			if (same) return Psql.sessionCreate(sessionId, userUuid, token);
			else throw loginError;
		})
		.then(() => utils.buildNewResponse(200, 'Success', {token: token}))
		.catch((err) => err)
		.then((data) => utils.respond(res, data));
});

module.exports = router;