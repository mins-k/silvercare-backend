const router = require('express').Router();
const { search } = require('../controllers/faqController');
router.get('/faq', search);
module.exports = router;