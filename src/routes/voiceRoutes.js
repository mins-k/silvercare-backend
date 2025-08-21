const express = require('express');
const router = express.Router();
const { handleVoice } = require('../controllers/voiceController');

router.post('/voice-input', handleVoice);

module.exports = router;