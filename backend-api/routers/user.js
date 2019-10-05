var router = require('express').Router();
var Psql = require('../sql/psql');
var Utils = require('../utils');
var Crypto = require('../crypto');

// Create a new user
router.get('/create/:username/:password', (req, res) => {
	/*
	User creation:
	1. username meets requirements
	2. password meets requirements
	3. check if user already exists
	4. generate uuid  -> userId
	5. generate keypair1 (with password) -> pubKey1 & privKey1
	6. generate unlock key (can be token) -> unlockKeyRaw
	7. generate keypair2 (with unlockKeyRaw) -> pubKey2 & privKey2
	8. encrypt unlock key with PubKey1 -> unlockKey
	9. hash password -> passhash
	10. send to SQL:
	- username TEXT
	- userid UUID
	- passhash TEXT
	- unlockkey TEXT
	- pubkey1 TEXT
	- pubkey2 TEXT
	- privkey1 TEXT
	- privkey2 TEXT
	*/

	let username = req.params.username;
	let password = Utils.b642str(req.params.password);

	let userId, passHash, unlockKeyRaw, unlockKey, pubKey1, privKey1, pubKey2, privKey2;

	if (
		Crypto.usernameMeetsRequirements(username) &&
		Crypto.passwordMeetsRequirements(password)
	) {
		Psql.userInfo(true, username)
			// Check if any users already exist (datasetEmpty throws error if 1 or more rows)
			.then((dataset) => Utils.datasetEmpty(dataset))

			// Generate a UUID for the new user
			.then(() => userId = Crypto.generateUuid())

			// Generate keypair1 using the password for the user
			.then(() => Crypto.generateKeyPair(password))
			.then(([pubKey, privKey]) => (pubKey1 = pubKey, privKey1 = privKey))

			// Generate an unlock key for decrypting messages
			.then(() => unlockKeyRaw = Crypto.generateToken())

			// Generate keypair2 using the unlock key
			.then(() => Crypto.generateKeyPair(unlockKeyRaw))
			.then(([pubKey, privKey]) => (pubKey2 = pubKey, privKey2 = privKey))

			// Encrypt the unlock key using keypair1 (decrypted on user login)
			.then(() => Crypto.encrypt(unlockKeyRaw, pubKey1))
			.then((encrypted) => unlockKey = encrypted)

			// Generate a password hash to safely store the password in the database
			.then(() => Crypto.generateHash(password))
			.then((hash) => passHash = hash)

			// Build an array to pass to SQL
			.then(() => [username, userId, passHash, unlockKey, pubKey1, pubKey2, privKey1, privKey2])
			.then((values) => Psql.userCreate(values))

			// Send a response
			.then(() => Utils.config.response.success)
			.catch((err) => Utils.buildError(err))
			.then((response) => Utils.respond(res, response));
	} else {
		Utils.respond(res, Utils.config.response.loginFailed);
	}
});

// Validate a username/password and respond with a token
router.get('/login/:username/:password', (req, res) => {
	let username = req.params.username;
	let password = Utils.b642str(req.params.password);

	const loginError = Utils.config.response.loginFailed;

	let userData, sessionId, token;
	Psql.userInfo(true, username)
		.then((dataset) => Utils.datasetFull(dataset))
		.then((dataset) => dataset[0])
		.then((mUserData) => {
			userData = mUserData;
			sessionId = Crypto.generateUuid();
			token = Crypto.generateToken();
			return Crypto.comparePassHash(password, userData.passhash);
		})
		.then((same) => {
			if (same) return Psql.sessionCreate(sessionId, userData.userid, token);
			else throw loginError;
		})
		.then(() => Utils.buildResponse(Utils.config.response.success, {
			token: token,
			user: userData
		}))
		.catch((err) => Utils.buildError(err, Utils.config.response.loginFailed))
		.then((response) => Utils.respond(res, response));
});

router.get('/getWithUuid/:recipientId', (req, res) => {
	let recipientId = req.paramss.recipientId;

	Psql.userInfo(false, recipientId)
		.then((dataset) => dataset[0])
		.then((user) => {
			let template = Utils.config.response.success;
			let response = Utils.buildResponse(template, { user: user });
			return response;
		})
		.catch((err) => Utils.buildError(err, utils.config.response.error))
		.then((response) => Utils.respond(res, response));
});

router.get('/getName/:userId', (req, res) => {
	let token = req.query.token;
	let userId = req.params.userId;

	Psql.userInfo(false, userId)
		.then((dataset) => Utils.datasetEmpty(dataset))
		.then((dataset) => dataset[0].username)
		.then((username) => {
			let template = Utils.config.response.success;
			let response = Utils.buildResponse(template, { username: username });
			return response;
		})
		.catch((err) => Utils.buildError(err))
		.then((response) => Utils.respond(res, response));
});

module.exports = router;