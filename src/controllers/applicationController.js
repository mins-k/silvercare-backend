const { createApplication, updateStatus, listByUser } = require('../models/applicationModel');

exports.create = async (req, res) => {
  try {
    const { userId, policyId } = req.body;
    if (!userId || !policyId) return res.status(400).json({ success:false, error:'userId, policyId 필요' });
    const app = await createApplication({ userId, policyId });
    return res.status(201).json({ success:true, application: app });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success:false, error: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!id || !status) return res.status(400).json({ success:false, error:'id, status 필요' });
    if (!['준비','제출','확인'].includes(status)) return res.status(400).json({ success:false, error:'허용되지 않은 상태' });
    const out = await updateStatus(id, status);
    return res.json({ success:true, application: out });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success:false, error: e.message });
  }
};

exports.listForUser = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success:false, error:'userId 필요' });
    const items = await listByUser(userId);
    return res.json({ success:true, items });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success:false, error: e.message });
  }
};