const { getGuide } = require('../models/guideModel');

exports.getGuideByPolicy = async (req, res) => {
  const { policyId } = req.params;
  const guide = await getGuide(policyId);
  if (!guide) return res.status(404).json({ success:false, error:'가이드를 찾을 수 없습니다.' });
  return res.json({ success:true, guide });
};