const multer               = require('multer');
const upload               = multer();
const { transcribeAudioFile, parseFromText } = require('../services/transcribeService');

exports.uploadAndParse = [
  upload.single('audio'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success:false, error:'audio 파일 필요' });
      }
      // 1) 오디오 → STT 텍스트
      const transcript = await transcribeAudioFile(req.file);

      // 2) 텍스트 → name·dob 파싱
      const parsed = parseFromText(transcript);

      return res.json({ success: true, transcript, parsed });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success:false, error:err.message });
    }
  }
];