SELECT
	U.username
FROM
	users U
INNER JOIN chats C
	ON U.userid = C.usera
	OR U.userid = C.userb

WHERE U.userid != $1
;

-- SELECT * FROM chats WHERE usera = $1 OR userb = $2;