// NPM modules
var express = require('express');
var compression = require('compression');

// Local imports
var utils = require('./utils');
var Routers = {
	user: require('./routers/user'),
	chats: require('./routers/chats'),
	messages: require('./routers/messages')
};

// Express setup
var app = express();

// Compress all traffic
app.use(compression());

// Check authentication requirements for all routes
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	utils.validate(req)
		.then(() => next())
		.catch((err) => utils.respond(res, err));
});

// Router for any 'user' routes
app.use('/user', Routers.user);
app.use('/chats', Routers.chats);
app.use('/messages', Routers.messages);

// Initialize and host the server
utils.init()
	.then((server) => {
		if (server.https) {
			require('https').createServer({
				key: '', // For key and cert, these values can be specific in config.json but must be passed as a data string
				cert: '',
			}, app).listen(server.port, () => console.log(`Server (HTTPS) hosted on: ${server.port}`))
		} else {
			app.listen(server.port, () => console.log(`Server hosted on: ${server.port}`));
		}
	})
	.catch((err) => console.error(err));

module.exports = app;