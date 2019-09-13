const { Pool, Client } = require('pg');

//TODO: Add SQL connections

var pool;
exports.init = () => {
	// pools will use environment variables
	// for connection information
	pool = new Pool();
	console.log(process.env.PGUSER);
}
module.exports.query1 = query1;
module.exports.query2 = query2;
module.exports.kill = kill;

async function query1() {
	// method 1: callbacks
	pool.query('SELECT NOW()', (err, res) => {
		console.log(err, res);
	});
}

async function query2() {
	// method 2: async/await
	//const res = await pool.query('SELECT NOW()');
	const res = await pool.query('SELECT * FROM messages;');
	console.log(res);
}

async function kill() {
	await pool.end();
	console.log('killed');
}

//TODO: change bigserial to uuid type for all identifiers
