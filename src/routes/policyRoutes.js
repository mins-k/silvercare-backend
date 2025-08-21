const express = require('express');
const router  = express.Router();

const adminAuth = require('../middlewares/adminAuth');

const {
  createPolicy,
  getPolicies,
  patchPolicy,
  removePolicy
} = require('../controllers/policyController');

router.get('/admin/policies', getPolicies);
router.post('/admin/policies', adminAuth, createPolicy);
router.patch('/admin/policies/:policyId', adminAuth, patchPolicy);
router.delete('/admin/policies/:policyId', adminAuth, removePolicy);

module.exports = router;