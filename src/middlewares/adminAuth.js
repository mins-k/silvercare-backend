module.exports = (req, res, next) => {
  const token = req.headers['x-admin-token'];
  const expected = process.env.ADMIN_TOKEN;
  if (!expected || token !== expected) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  next();
};
