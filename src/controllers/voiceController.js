const { parseFromText }   = require('../services/transcribeService');
const { saveUserRecord }  = require('../models/userModel');
const { synthesizeReply } = require('../services/pollyService');
const { chatWithGPT }     = require('../services/openaiService');

exports.handleVoice = async (req, res) => {
  try {
        const parsed = parseFromText(req.body.transcript);
    const { name, dob } = parsed;

    const missing = [];
    if (name === '알수없음') missing.push('이름');
    if (dob  === '알수없음') missing.push('생년월일');
    if (missing.length > 0) {
      return res.json({
        success:   false,
        replyText: `${missing.join('과 ')} 정보가 누락되었거나 형식이 잘못되었습니다. 다시 알려주세요.`
      });
    }
    const item = await saveUserRecord(parsed);

    const systemPrompt = {
      role: "system",
      content: `당신은 공손하고 간결한 복지 상담 챗봇입니다.
어르신이 쉽게 이해할 수 있게 1~2문장으로 답변하세요.`
    };
    const fewShot = [
      {
        role: "user",
        content: "이름: 홍길동\n생년월일: 1980-01-01\n위 정보가 올바른가요?"
      },
      {
        role: "assistant",
        content: "네, 홍길동님, 생년월일 1980년 1월 1일이 맞습니다."
      }
    ];
    const userPrompt = {
      role: "user",
      content: `이름: ${name}\n생년월일: ${dob}\n위 정보가 올바른가요?`
    };

    const messages = [systemPrompt, ...fewShot, userPrompt];
    const gptReply = await chatWithGPT(messages);
    const audioUrl = await synthesizeReply(gptReply);

    return res.json({
      success:   true,
      replyText: gptReply,
      audioUrl
    });
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error:   err.message
    });
  }
};