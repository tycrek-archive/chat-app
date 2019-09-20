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
module.exports = app;
app.use(compression());

// Routes

// Check authentication requirements for all routes
app.use((req, res, next) => { //TODO: Try and move _checkAuthorized() to a different file

	return utils.validate(req).then(() => {
		next();
	}).catch((err) => {
		let code = err.split('::')[0];
		let data = {
			status: code,
			reason: err.split('::')[1]
		};
		utils.respond(res, data, code);
	});
});

app.get('/', (req, res) => {
	require('fs-extra').readFile(utils.getPath('index.html'), (err, data) => {
		if (err) return utils.respond(res, err, 500, 'text');
		utils.respond(res, data.toString(), 200, 'html');
	});
});

app.use('/user', Routers.user);

//TODO: Improve app.listen
//TODO: HTTPS either with https module or Apache proxy on server
utils.init().then(() => {
	let port = utils.config().port;
	app.listen(port, () => {
		console.log(`Server hosted on: ${port}`);
	});
}).catch((err) => {
	console.error(err);
});
