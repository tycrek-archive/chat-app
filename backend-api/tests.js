let psql = require('./sql/psql');
var uuid = require('./tools/uuid');
var bcrypt = require('./tools/bcrypt');
var utils = require('./utils');

exports.test = () => {
	//this.bcrypt();
	//this.uuid();
	//this.createUser();
	//this.testUser();
	//this.b64();
}

exports.bcrypt = () => {
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
	console.log(uuid.generate());
}

exports.createUser = () => {

	bcrypt.hash('hunter22').then((mHash) => {
		let mName = 'joshuam17';
		let mUuid = uuid.generate();
		psql.createUser(mName, mUuid, mHash).then(() => {
			console.log(`User ${mName} created.`);
		}).catch((err) => console.log(err));
	}).catch((err) => console.error(err));
}

exports.testUser = () => {
	psql.getHash('joshuam17').then((result) => {
		bcrypt.compare('sadojisadf', result.hash).then((same) => {
			console.log(same);
		}).catch((err) => console.error(err));
	}).catch((err) => console.error(err));
}

exports.b64 = () => {
	let foo = utils.str2b64('hello');
	let bar = utils.b642str(foo);
	console.log(foo + ' ' + bar);
}