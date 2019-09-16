// NPM modules
var express = require('express');
var compression = require('compression');

// Local imports
var utils = require('./utils');

// Express setup
var app = express();
module.exports = app;
app.use(compression());
app.use('/account', require('./routers/account'));


//// Routes

// Check authentication requirements for all routes
app.use((req, res, next) => { //TODO: Try and move _checkAuthorized() to a different file
	_checkAuthorized(req, (isAuthenticated, isAuthorized, reason) => {
		if (isAuthorized) {
			// User authorized. Do not check authenticated as some endpoints are public (login)
			next();
		}
		else if (isAuthenticated && !isAuthorized) {
			// Logged in, but cannot access this resource
			res.status(403).send(`403: Forbidden: ${reason}`);
		} else {
			// Not logged in
			res.status(401).send(`401: Unauthorized: ${reason}`);
		}
	});

	function _checkAuthorized(req, callback) {
		//TODO: Check the request headers for a valid token
		callback(false, true, 'Failure reason')
	}
});

//TODO: Add routes (research express Routers)
app.get('/', (req, res) => res.status(200).send('Homepage'));

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
