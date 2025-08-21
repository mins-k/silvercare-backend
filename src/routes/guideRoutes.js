const router = require('express').Router();
const { getGuideByPolicy } = require('../controllers/guideController');
router.get('/guides/:policyId', getGuideByPolicy);
module.exports = router;