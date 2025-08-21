require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const matchRoutes = require('./routes/matchRoutes');
const profileRoutes = require('./routes/profileRoutes');
const voiceRoutes = require('./routes/voiceRoutes');
const policyRoutes = require('./routes/policyRoutes');
const transcribeRoutes = require('./routes/transcribeRoutes');
const chatRoutes = require('./routes/chatRoutes');
const faqRoutes = require('./routes/faqRoutes');
const guideRoutes = require('./routes/guideRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const voiceTurnRoutes = require('./routes/voiceTurnRoutes');

const app = express();
const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    try {
      const u = new URL(origin);
      const allow =
        origin === 'http://localhost:5173' ||
        origin === 'http://localhost:3000' ||
        origin === 'https://2025hackathon-five.vercel.app' ||
        (u.protocol === 'https:' && /\.ngrok-free\.app$/.test(u.hostname));
      return cb(allow ? null : new Error(`Not allowed by CORS: ${origin}`), allow);
    } catch {
      return cb(new Error(`Bad origin: ${origin}`));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/api', matchRoutes);
app.use('/api', profileRoutes);
app.use('/api', voiceRoutes);
app.use('/api', policyRoutes);
app.use('/api', transcribeRoutes);
app.use('/api', chatRoutes);
app.use('/api', guideRoutes);
app.use('/api', faqRoutes);
app.use('/api', voiceTurnRoutes);
app.use('/api', applicationRoutes);
app.get('/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Server error',
  });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`✅ API listening on http://localhost:${port}`);
});