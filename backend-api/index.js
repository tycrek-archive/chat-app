// NPM modules
var express     = require('express');
var compression = require('compression');

// Local imports
var utils = require('./utils');
var Routers = {
	user: require('./routers/user')
};

// Express setup
var app = express();

// Compress all traffic
app.use(compression());

// Check authentication requirements for all routes
app.use((req, res, next) => {
	utils.validate(req)
		.then(() => next())
		.catch((err) => utils.respond(res, err, code));
});

// For testing ONLY
app.get('/', (_req, res) => {
	require('fs-extra').readFile(utils.getPath('index.html'), (err, data) => {
		if (err) utils.respond(res, err, 500, 'text');
		else utils.respond(res, data.toString(), 200, 'html');
	});
});

// Router for any 'user' routes
app.use('/user', Routers.user);

//TODO: Improve app.listen
//TODO: HTTPS either with https module or Apache proxy on server
utils.init()
	.then((server) => {
		if (!server.https) {
			app.listen(server.port, () => console.log(`Server hosted on: ${server.port}`));
		} else {
			let https = require('https');
			https.createServer({
				key: '', // For key and cert, these values can be specific in config.json but must be passed as a data string
				cert: '',
			}, app).listen(server.port, () => console.log(`Server (HTTPS) hosted on: ${server.port}`))
		}
	})
	.catch((err) => console.error(err));

module.exports = app;