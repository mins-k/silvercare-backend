const express = require('express');
const router  = express.Router();
const { uploadAndParse } = require('../controllers/transcribeController');
router.post('/transcribe', uploadAndParse);

module.exports = router;