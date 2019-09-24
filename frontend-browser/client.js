var crypto = require('crypto');

const SERVER = 'localhost';

window.encrypt = function (data, publicKey) {
	let buffer = Buffer.from(data);
	let encrypted = crypto.publicEncrypt(publicKey, buffer);
	return encrypted.toString('base64');
};

window.decrypt = function (data, privateKey, password) {
	let buffer = Buffer.from(data, 'base64');
	let decrypted = crypto.privateDecrypt({
		key: privateKey,
		passphrase: password
	}, buffer);
	return decrypted.toString('utf8');
};

window.pageNewUser = function () {
	this.fetch('/html/newUser.html')
		.then((res) => res.text())
		.then((text) => $('#content').html(text));
};

window.pageLogin = function () {
	this.fetch('/html/login.html')
		.then((res) => res.text())
		.then((body) => $('#content').html(body));
};

window.pageChats = function () {
	this.fetch('/html/chats.html')
		.then((res) => res.text())
		.then((body) => $('#content').html(body));
};

window.signUp = function () {
	$('#loading').show();
	let username = $('#username').val();
	let password = btoa($('#password').val());

	fetch(`http://${SERVER}:34682/user/create/${username}/${password}`)
		.then((res) => res.json())
		.then((json) => {
			if (json.code != 200) this.alert(json.reason);
			else pageLogin();
		})
		.catch((err) => console.error(err));
};