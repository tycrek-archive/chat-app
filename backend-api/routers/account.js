var router = require('express').Router();

router.get('/create', (req, res) => {
	console.log('account create');
	res.status(200).send('create!');
});

module.exports = router;