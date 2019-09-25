var crypto = require('crypto');

// Encrypt raw data using a public key
// Returned data should be encoded using btoa()
// before sending to server
window.encrypt = function (data, publicKey) {
	let buffer = Buffer.from(data);
	let encrypted = crypto.publicEncrypt(publicKey, buffer);
	return encrypted.toString('base64');
};

// Decrypt data using a private key and password
window.decrypt = function (data, privateKey, password) {
	let buffer = Buffer.from(data, 'base64');
	let decrypted = crypto.privateDecrypt({
		key: privateKey,
		passphrase: password
	}, buffer);
	return decrypted.toString('utf8');
};