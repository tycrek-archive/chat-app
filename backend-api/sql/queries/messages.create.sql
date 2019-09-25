INSERT INTO messages(
	message_id,
	chat_id,
	read,
	data,
	time,
	sender_id,
	recipient_id
)
VALUES(
	$1,
	$2,
	false,
	$3,
	timezone('UTC'::text, (now())),
	$4,
	$5
);