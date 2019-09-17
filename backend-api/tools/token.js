var crypto = require('crypto');

exports.generate = () => crypto.randomBytes(32).toString('hex');