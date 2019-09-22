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
	.then(() => {
		let port = utils.config().port;
		app.listen(port, () => {
			console.log(`Server hosted on: ${port}`);
		});
	})
	.catch((err) => {
		console.error(err);
	});

module.exports = app;