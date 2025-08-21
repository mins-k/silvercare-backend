const multer = require('multer');
const upload = multer();
const { transcribeAudioFile } = require('../services/transcribeService');
const { chat } = require('./chatController'); 
exports.voiceTurn = [
  upload.single('audio'),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ success:false, error:'audio 파일 필요' });
      const transcript = await transcribeAudioFile(req.file);
      req.body = { userId: req.query.userId, message: transcript, tts: true };
      return chat(req, res); 
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success:false, error:e.message });
    }
  }
];