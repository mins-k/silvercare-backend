const router = require('express').Router();
const { voiceTurn } = require('../controllers/voiceTurnController');
router.post('/voice-turn', voiceTurn);
module.exports = router;