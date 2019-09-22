var router = require('express').Router();
var Psql = require('../sql/psql');
var utils = require('../utils');

// Create a new user
router.get('/create/:name/:pass', (req, res) => {
	let name = req.params.name;
	let pass = utils.b642str(req.params.pass);
	let uuid = utils.generateUuid();

	let response = {
		status: 200,
		success: true,
		error: null
	};

	_createAccount(name, pass, uuid)
		.then(() => utils.respond(res, response))
		.catch((err) => {
			response.status = 400;
			response.success = false;
			response.error = err;
			utils.respond(res, response, 400);
		});

	function _createAccount(name, pass, uuid) {
		return new Promise((resolve, reject) => {
			if (!utils.passwordMeetsRequirements(pass)) reject('Bad password');
			else utils.generateHash(pass)
				.then((hash) => Psql.userCreate(name, uuid, hash))
				.then(() => resolve())
				.catch((err) => reject(err));
		});
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
			sessionId = utils.generateUuid();
			token = utils.generateToken();
			return utils.comparePassHash(password, userInfo.hash);
		})
		.then((same) => {
			if (!same) throw loginError;
			else return Psql.sessionCreate(sessionId, userUuid, token);
		})
		.then(() => utils.buildResponse(200, 'Success', {token: token}))
		.catch((err) => err)
		.then((data) => utils.respond(res, data));
});

// List current user accounts (testing only!)
router.get('/list', (req, res) => {
	Psql.accountList(10).then((dataset) => {
		res.status(200).send(dataset);
	}).catch((err) => {
		res.status(200).send(err);
	})
});


module.exports = router;