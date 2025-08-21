const { detectIntent } = require('../utils/intent');
const { getHistory, appendMessage } = require('../models/chatModel');
const { matchPolicies } = require('../services/matchService');
const { synthesizeReply } = require('../services/pollyService');
const { chatWithGPT } = require('../services/openaiService');

function summarizePolicies(items, n = 3) {
  const top = items.slice(0, n);
  if (!top.length) return '지금 조건에 맞는 정책을 찾지 못했어요.';
  const lines = top.map((p, i) => {
    const amt = p.supportAmount ? `${(p.supportAmount / 10000).toFixed(0)}만원` : '지원금 없음';
    const ddl = p.deadline || '마감일 미정';
    return `${i + 1}) ${p.title} - ${amt}, 마감 ${ddl}`;
  });
  return `지금 기준으로 ${top.length}건이 있습니다.\n` + lines.join('\n');
}


exports.chat = async (req, res) => {
  try {
    const { userId, message = '', tts = false } = req.body;
    if (!userId) return res.status(400).json({ success: false, error: 'userId가 필요합니다.' });

    // 히스토리 적재(사용자)
    await appendMessage(userId, 'user', message);

    const intent = detectIntent(message);
    let replyText = '';
    let payload = {};

    if (intent === 'recommend') {
      const matched = await matchPolicies(userId);
      replyText = summarizePolicies(matched, 3);
      payload.items = matched.slice(0, 10);
    } else if (intent === 'faq') {
      replyText =
        '신청 절차를 찾고 계시군요. 어떤 정책(서비스)인지 말씀해 주시면 제출 서류와 단계별 절차를 알려 드릴게요.';
    } else if (intent === 'profile_update') {
      replyText = '정보 변경을 도와드릴게요. 주소·소득·가구 형태 중 어떤 항목을 바꾸실까요?';
    } else if (intent === 'status') {
      replyText =
        '신청하신 정책의 진행 상태를 확인하려면 MY 메뉴의 신청내역을 열어주세요. 연결이 필요하면 “신청내역 열어줘”라고 말씀해 주세요.';
    } else {

      const hist = await getHistory(userId, 6); 
      const history = hist.map((h) => ({ role: h.role, content: h.content }));
      const system = {
        role: 'system',
        content: `당신은 노년층을 돕는 공손하고 친절한 한국어 상담사입니다.
- 문장은 짧고 쉬운 단어로 1~2문장 이내.
- 복지/정책 질문이면 간단히 요지를 확인하고 '지원/정책' 키워드를 사용해 추천을 제안하세요.
- 날씨나 일상 대화에는 따뜻하게 응답하세요.`
      };
      const messages = [system, ...history, { role: 'user', content: message }];
      replyText = await chatWithGPT(messages);
    }


    await appendMessage(userId, 'assistant', replyText);

    let audioUrl;
    if (tts) {
      audioUrl = await synthesizeReply(replyText.replace(/\n/g, ' '));
    }

    return res.json({ success: true, replyText, audioUrl, ...payload });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const { userId, limit = 20 } = req.query;
    if (!userId) return res.status(400).json({ success: false, error: 'userId 필요' });
    const items = await getHistory(userId, Number(limit));
    return res.json({ success: true, items });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, error: e.message });
  }
};