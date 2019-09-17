var router = require('express').Router();
var psql = require('../sql/psql');
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
				psql.accountCreate(name, uuid, hash).then(() => {
					resolve();
				}).catch((err) => reject(err));
			}).catch((err) => reject(err));
		});
	}
});

router.get('/list', (req, res) => {
	psql.accountList(10).then((dataset) => {
		res.status(200).send(dataset);
	}).catch((err) => {
		res.status(200).send(err);
	})
});

module.exports = router;