// Functions within this file are responsible for fetching HTML and updating the UI

window.fetchPage = function (route, callback = null) {
	this.fetch(route)
		.then((res) => res.text())
		.then((text) => $('#content').html(text))
		.then(() => callback && callback());
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

window.pageMessages = function (userId) {
	fetchPage('/html/messages.html', () => {
		listMessages(userId);
	});
};