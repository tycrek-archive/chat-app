INSERT INTO users(
	username,
	userid,
	passhash,
	unlockkey,
	pubkey1,
	pubkey2,
	privkey1,
	privkey2
) VALUES(
	$1,
	$2,
	$3,
	$4,
	$5,
	$6,
	$7,
	$8
);