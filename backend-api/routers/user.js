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
	//let password = req.params.password;

	const loginError = utils.config().response.loginFailed;

	// first check if user exists
	Psql.userInfo('NAME', username).then((dataset) => {
		if (dataset.length === 0) {
			utils.respond(res, loginError, loginError.code);
		} else {
			// second, check the password
			utils.comparePassHash(password, dataset[0].hash).then((same) => {
				if (!same) utils.respond(res, loginError, loginError.code);
				else {
					// create a new session
					let session_id = utils.generateUuid();
					let user_uuid = dataset[0].uuid;
					let token = utils.generateToken();

					Psql.sessionCreate(session_id, user_uuid, token).then(() => {
						let response = {
							status: 200,
							success: true,
							token: token
						};
						res.status(200).type('json').send(response);
					}).catch((err) => _send(err));
				}
			});
		}
	}).catch((err) => {
		utils.respond(res, err, 500);
	});
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