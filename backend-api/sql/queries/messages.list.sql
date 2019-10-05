SELECT * FROM messages
WHERE
	(senderid = $1 AND recipientid = $2 AND original = true) OR
	(senderid = $3 AND recipientid = $4)

ORDER BY "time";