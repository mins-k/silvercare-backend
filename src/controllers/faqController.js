const { searchFAQ } = require('../utils/faqSearch');

exports.search = async (req, res) => {
  const { query = '', limit = 5 } = req.query;
  if (!query) return res.status(400).json({ success:false, error:'query 필요' });
  const items = searchFAQ(query, Number(limit));
  return res.json({ success:true, items });
};