exports.test = () => {
	this.bcrypt();
	this.uuid();
}

exports.bcrypt = () => {
	var bcrypt = require('./tools/bcrypt');
	let hash = '';
	bcrypt.hash('hunter2').then((h) => {
		console.log(h);
		hash = h;
		bcrypt.compare('hunter2', hash).then((same) => {
			console.log(same);
		}).catch((err) => console.error(err));
	}).catch((err) => console.error(err));
}

exports.uuid = () => {
	console.log(require('./tools/uuid').generate());
}