var router = require('express').Router();
var psql = require('../sql/psql');
var utils = require('../utils');

router.get('/credentials/:username/:password', (req, res) => {
	let username = req.params.username;
	let password = utils.b642str(req.params.password);

	// first check if user exists
	psql.accountInfo('NAME', username).then((dataset) => {
		if (dataset.length === 0) {
			_send('Invalid username or password!');
		} else {
			// second, check the password
			utils.comparePassHash(password, dataset[0].hash).then((same) => {
				if (!same) _send('Invalid username or password!');
				else {
					// create a new session
					let session_id = utils.generateUuid();
					let user_uuid = dataset[0].uuid;
					let token = utils.generateToken();

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