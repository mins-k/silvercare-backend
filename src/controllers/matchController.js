const { matchPolicies } = require('../services/matchService');

exports.getMatch = async (req, res) => {
  try {
    const userId = req.query.userId;
    const matched = await matchPolicies(userId);
    return res.json({ success: true, matched });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};