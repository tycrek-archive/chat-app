// NPM modules
var express = require('express');
var compression = require('compression');
var fs = require('fs-extra');

// Local imports
var Utils = require('./utils');

// Express setup
var app = express();

// Compress all traffic
app.use(compression());

// Static routes
app.use('/html', express.static('html'));

// Routes
app.get('/', (_req, res) => {
	fs.readFile(Utils.getPath('html/index.html'))
		.then((bytes) => bytes.toString())
		.then((data) => Utils.respond(res, data, 200, 'html'))
		.catch((err) => Utils.respond(res, err, 500));
});

app.get('/js', (_req, res) => {
	Utils.browserify()
		.then((js) => Utils.respond(res, js, 200, 'js'))
		.catch((err) => Utils.respond(res, err, 500));
});

app.get('/css', (req, res) => {
	// send CSS
});

// Host server
Utils.init()
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