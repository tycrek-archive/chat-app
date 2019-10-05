INSERT INTO messages(
	message_id,
	read,
	data,
	time,
	senderid,
	recipientid,
	original
)
VALUES(
	$1,
	false,
	$2,
	timezone('UTC'::text, (now())),
	$3,
	$4,
	$5
);