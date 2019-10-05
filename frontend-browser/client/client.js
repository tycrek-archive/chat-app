const HOST = 'localhost';
const PORT = 34682;
const BASE = `http://${HOST}:${PORT}`;

let Handlebars = require('handlebars');

window.tokenCheck = function () {
	let token = Cookies.get('token');
	if (token == null) alert('Please sign in');
	else return true;
};

window.tokenGet = function () {
	let token = Cookies.get('token');
}

window.signUp = function () {
	$('#loading').show();
	let username = $('#username').val();
	let password = btoa($('#password').val());

	this.fetch(`${BASE}/user/create/${username}/${password}`)
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

	this.fetch(`${BASE}/user/login/${username}/${password}`)
		.then((res) => res.json())
		.then((json) => {
			$('#loading').hide();
			if (json.code != 200) this.alert(json.reason);
			else return json.data;
		})
		.then((data) => {
			Cookies.set('unlockkey', decrypt(data.user.unlockkey, data.user.privkey1, atob(password)));
			Cookies.set('token', data.token, { expires: 7 });
			Cookies.set('pubkey2', data.user.pubkey2);
			Cookies.set('privkey2', data.user.privkey2);
			Cookies.set('userid', data.user.userid);
		})
		.then(() => pageChats());
}

////////////////
////////////////
//    Chats   //
////////////////
////////////////
window.listChats = function () {
	let token = Cookies.get('token');
	if (token == null) alert('Please sign in');
	else {
		let template;
		this.fetch('/html/chat_item.mustache')
			.then((res) => res.text())
			.then((text) => template = text)
			.then(() => this.fetch(`${BASE}/chats/list?token=${token}`))
			.then((res) => res.json())
			.then((json) => {
				$('#loading').hide();
				if (json.code != 200) this.alert(json.reason);
				else {
					json.data.chats.forEach((chat) => {
						let userId = chat.userid
						let name = chat.username;
						let renderer = Handlebars.compile(template);
						let result = renderer({ name: name, userId: userId });
						$('#chat-list').append(result);
					});
				}
			});
	}
}

window.createChat = function () {
	let token = Cookies.get('token');
	if (token == null) alert('Please sign in');
	else {
		let recipient = $('#recipient').val();

		this.fetch(`${BASE}/chats/create/${recipient}?token=${token}`)
			.then((res) => res.json())
			.then((json) => json.code != 200 && this.alert(json.reason))
			.then(() => pageChats());
	}
}

////////////////
////////////////
//  Messages  //
////////////////
////////////////
window.sendMessage = function () {
	let token = Cookies.get('token');
	if (token == null) alert('Please sign in');
	else {
		let message = $('#message').val();
		let pubKeySender = Cookies.get('pubkey2');
		let pubKeyRecipient = Cookies.get('pubkeytemp');

		let encryptedSender = encrypt(message, pubKeySender);
		let encodedSender = this.btoa(encryptedSender);

		let encryptedRecipient = encrypt(message, pubKeyRecipient);
		let encodedRecipient = this.btoa(encryptedRecipient);

		let senderId = Cookies.get('userid');
		let recipientId = Cookies.get('useridtemp');

		this.fetch(`${BASE}/messages/create/${senderId}/${recipientId}/${encodedSender}/1?token=${token}`)
			.then((res) => res.text())
			.then(() => this.fetch(`${BASE}/messages/create/${senderId}/${recipientId}/${encodedRecipient}/0?token=${token}`))
			.then((res) => res.text())
			.then(() => listMessages(recipientId));

		/*this.fetch(`${BASE}/messages/create/${chatId}/${encoded}?token=${token}`)
			.then((res) => res.json())
			.then((json) => json);*/
	}
}

window.listMessages = function (recipientId) {
	let token = Cookies.get('token');
	if (token == null) alert('Please sign in');
	else {
		$('#messages-list').html('');
		$('#loading').show();
		this.fetch(`${BASE}/messages/list/${recipientId}?token=${token}`)
			.then((res) => res.json())
			.then((json) => {
				$('#loading').hide();
				if (json.code != 200) this.alert(json.reason);
				else return json.data;
			})
			.then((data) => {
				let recip = data.recipient;
				Cookies.set('useridtemp', recip.userid);
				Cookies.set('pubkeytemp', recip.pubkey2);

				let messages = data.messages;
				for (let i = 0; i < messages.length; i++) {
					let message = messages[i];

					if (message.recipientid === Cookies.get('userid') && message.original) continue;

					let privKey = Cookies.get('privkey2');
					let password = Cookies.get('unlockkey');
					let decrypted = decrypt(atob(message.data), privKey, password);

					let float = message.senderid === Cookies.get('userid') ? 'right' : 'left';

					let ui = `
					<div style="text-align: ${float};">${decrypted}</div>
					`;

					$('#messages-list').append(ui);
					//console.log(decrypted);
				}
			});
	}
}