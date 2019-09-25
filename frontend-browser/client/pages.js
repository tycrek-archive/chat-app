window.fetchPage = function (route) {
	this.fetch(route)
		.then((res) => res.text())
		.then((text) => $('#content').html(text));
};

window.pageNewUser = function () {
	fetchPage('/html/newUser.html');
};

window.pageLogin = function () {
	fetchPage('/html/login.html');
};

window.pageChats = function () {
	fetchPage('/html/chats.html');
};

window.pageMessages = function () {
	fetchPage('/html/messages.html');
};