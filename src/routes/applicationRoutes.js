const router = require('express').Router();
const { create, update, listForUser } = require('../controllers/applicationController');

router.post('/applications', create);
router.put('/applications/:id/status', update);
router.get('/applications', listForUser);

module.exports = router;