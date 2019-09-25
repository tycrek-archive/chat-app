const SERVER = 'localhost';

window.signUp = function () {
	$('#loading').show();
	let username = $('#username').val();
	let password = btoa($('#password').val());

	this.fetch(`http://${SERVER}:34682/user/create/${username}/${password}`)
		.then((res) => res.json())
		.then((json) => {
			$('#loading').hide();
			if (json.code != 200) this.alert(json.reason);
			else pageLogin();
		})
		.catch((err) => console.error(err));
};

window.login = function () {
	$('#loading').show();
	let username = $('#username').val();
	let password = btoa($('#password').val());

	this.fetch(`http://${SERVER}:34682/user/login/${username}/${password}`)
		.then((res) => res.json())
		.then((json) => {
			$('#loading').hide();
			if (json.code != 200) this.alert(json.reason);
			else return json.data.token;
		})
		.then((token) => {
			Cookies.set('token', token, { expires: 7 });
			return this.fetch(`http://${SERVER}:34682/keypairs/private?token=${token}`);
		})
		.then((res) => res.json())
		.then((json) => json.data.privKey)
		.then((privKey) => this.localStorage.setItem('privKey', privKey))
		.then(() => this.localStorage.setItem('password', atob(password)))
		.then(() => pageChats());
}

window.listChats = function () {
	let token = Cookies.get('token');
	if (token == null) alert('Please sign in');
	else {
		this.fetch(`http://${SERVER}:34682/chats/list?token=${token}`)
			.then((res) => res.json())
			.then((json) => {
				$('#loading').hide();
				if (json.code != 200) this.alert(json.reason);
				else {
					$('#chat-list').html(JSON.stringify(json.data.chats, null, 4));
				}
			});
	}
}

window.createChat = function () {
	let token = Cookies.get('token');
	if (token == null) alert('Please sign in');
	else {
		let recipient = $('#recipient').val();

		this.fetch(`http://${SERVER}:34682/chats/create/${recipient}?token=${token}`)
			.then((res) => res.json())
			.then((json) => {
				if (json.code != 200) this.alert(json.reason);
				else return json.data.chatId;
			})
			.then((chatId) => sendMessage(chatId));
	}
}

window.sendMessage = function (chatId) {
	let token = Cookies.get('token');
	if (token == null) alert('Please sign in');
	else {
		let message = $('#message').val();
		let recipient = $('#recipient').val();

		this.fetch(`http://${SERVER}:34682/keypairs/public/${recipient}?token=${token}`)
			.then((res) => res.json())
			.then((json) => {
				if (json.code != 200) this.alert(json.reason);
				else return json.data.pubKey;
			})
			.then((pubKey) => encrypt(message, pubKey))
			.then((encrypted) => this.btoa(encrypted))
			.then((encoded) => this.fetch(`http://${SERVER}:34682/messages/create/${chatId}/${encoded}?token=${token}`))
			.then((res) => res.json())
			.then((json) => {
				if (json.code != 200) this.alert(json.reason);
				else alert(json.reason);
		})
	}
}

window.listMessages = function () {
	let token = Cookies.get('token');
	if (token == null) alert('Please sign in');
	else {
		$('#loading').show();
		let chatId = $('#chatId').val();
		this.fetch(`http://${SERVER}:34682/messages/list/${chatId}?token=${token}`)
			.then((res) => res.json())
			.then((json) => {
				$('#loading').hide();
				if (json.code != 200) this.alert(json.reason);
				else return json.data.messages;
			})
			.then((messages) => {

				for (let i = 0; i < messages.length; i++) {
					let message = messages[i];
					let privKey = this.localStorage.getItem('privKey');
					let password = this.localStorage.getItem('password');
					let decrypted = decrypt(atob(message.data), privKey, password);
					console.log(decrypted);
				}
			});
	}
}