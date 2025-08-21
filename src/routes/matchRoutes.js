const router = require('express').Router();
const { getMatch } = require('../controllers/matchController');

router.get('/match', getMatch);

module.exports = router;