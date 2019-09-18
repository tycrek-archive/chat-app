var router = require('express').Router();
var Psql = require('../sql/psql');
var utils = require('../utils');

router.get('/create/:name/:pass', (req, res) => {
	let name = req.params.name;
	let pass = utils.b642str(req.params.pass);
	let uuid = utils.generateUuid();

	_createAccount(name, pass, uuid).then(() => {
		console.log(`User ${name} created`);
		res.status(200).send('Created');
	}).catch((err) => {
		console.error(err);
		res.status(200).send(err);
	});

	function _createAccount(name, pass, uuid) {
		return new Promise((resolve, reject) => {
			if (!utils.passwordMeetsRequirements(pass)) {
				return reject('Bad password');
			}
			utils.generateHash.hash(pass).then((hash) => {
				Psql.userCreate(name, uuid, hash).then(() => {
					resolve();
				}).catch((err) => reject(err));
			}).catch((err) => reject(err));
		});
	}
});

router.get('/login/:username/:password', (req, res) => {
	let username = req.params.username;
	let password = utils.b642str(req.params.password);
	//let password = req.params.password;

	const loginError = {
		status: 400,
		reason: 'Invalid username/password'
	};

	// first check if user exists
	Psql.userInfo('NAME', username).then((dataset) => {
		if (dataset.length === 0) {
			utils.respond(res, loginError, 400);
		} else {
			// second, check the password
			utils.comparePassHash(password, dataset[0].hash).then((same) => {
				if (!same) utils.respond(res, loginError, 400);
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

router.get('/list', (req, res) => {
	Psql.accountList(10).then((dataset) => {
		res.status(200).send(dataset);
	}).catch((err) => {
		res.status(200).send(err);
	})
});


module.exports = router;