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

window.pageMessages = function () {
	this.fetch('/html/messages.html')
		.then((res) => res.text())
		.then((text) => $('#content').html(text));
};