var router = require('express').Router();
var psql = require('../sql/psql');
var bcrypt = require('../tools/bcrypt');
var uuid = require('../tools/uuid');
var Token = require('../tools/token');

router.get('/credentials/:username/:password', (req, res) => {
	let username = req.params.username;
	let password = req.params.password;

	// first check if user exists
	psql.accountInfo(0, username).then((dataset) => {
		if (dataset.length === 0) {
			_send('Invalid username or password!');
		} else {
			// second, check the password
			bcrypt.compare(password, dataset[0].hash).then((same) => {
				if (!same) _send('Invalid username or password!');
				else {
					// create a new session
					let session_id = uuid.generate();
					let user_uuid = dataset[0].uuid;
					let token = Token.generate();

					psql.sessionCreate(session_id, user_uuid, token).then(() => {
						let response = {
							success: true,
							token: token
						};
						res.status(200).type('json').send(response);
					}).catch((err) => _send(err));
				}
			});
		}
	}).catch((err) => {
		res.status(200).send(err);
	});

	function _send(data) {
		res.status(200).send(data);
	}
});



module.exports = router;