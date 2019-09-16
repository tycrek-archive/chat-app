const bcrypt = require('bcrypt');
const saltRounds = 16;

exports.hash = (password) => {
	return new Promise((resolve, reject) => {
		bcrypt.genSalt(saltRounds, (err, salt) => {
			if (err) return reject(err);
			bcrypt.hash(password, salt, (err, hash) => {
				if (err) return reject(err);
				resolve(hash);
			});
		});
	});
}

exports.compare = (password, hash) => {
	return new Promise((resolve, reject) => {
		bcrypt.compare(password, hash, (err, same) => {
			if (err) reject(err);
			else resolve(same);
		});
	});
}