const express = require('express');
const router  = express.Router();
const { submitProfile } = require('../controllers/profileController');
router.post('/profile', submitProfile);

module.exports = router;