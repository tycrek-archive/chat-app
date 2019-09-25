// NPM modules
var express     = require('express');
var compression = require('compression');

// Local imports
var utils = require('./utils');
var Routers = {
	user: require('./routers/user'),
	keypairs: require('./routers/keypairs'),
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

// For testing ONLY
app.get('/', (_req, res) => {
	require('fs-extra').readFile(utils.getPath('index.html'), (err, data) => {
		if (err) utils.respond(res, err, 500, 'text');
		else utils.respond(res, data.toString(), 200, 'html');
	});
});

// Also testing ONLY
app.get('/query/:query', (req, res) => {
	let query = utils.b642str(req.params.query);
	require('./sql/psql').anyQuery(query)
		.then((dataset) => utils.respond(res, dataset))
		.catch((err) => utils.respond(res, err, 500, 'text'));
});

app.get('/bundle.js', (_req, res) => {
	require('fs-extra').readFile(utils.getPath('bundle.js'))
		.then((bytes) => bytes.toString())
		.then((data) => utils.respond(res, data, 200, 'js'))
		.catch((err) => utils.respond(res, utils.config().response.error));
});

// Router for any 'user' routes
app.use('/user', Routers.user);
app.use('/keypairs', Routers.keypairs);
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