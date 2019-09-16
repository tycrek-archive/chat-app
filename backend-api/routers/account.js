var router = require('express').Router();
var psql = require('../sql/psql');
var Uuid = require('../tools/uuid');
var password = require('../tools/password');
var bcrypt = require('../tools/bcrypt');

// jacob15, 1234WorDA6789!@
router.get('/create/:name/:pass', (req, res) => {
	let name = req.params.name;
	let pass = req.params.pass;
	let uuid = Uuid.generate();

	_createAccount(name, pass, uuid).then(() => {
		console.log(`User ${name} created`);
		res.status(200).send('Created');
	}).catch((err) => {
		console.error(err);
		res.status(200).send(err);
	});

	function _createAccount(name, pass, uuid) {
		return new Promise((resolve, reject) => {
			if (!password.checkRequirements(pass)) {
				return reject('Bad password');
			}
			bcrypt.hash(pass).then((hash) => {
				psql.createUser(name, uuid, hash).then(() => {
					resolve();
				}).catch((err) => reject(err));
			}).catch((err) => reject(err));
		});
	}
});

module.exports = router;