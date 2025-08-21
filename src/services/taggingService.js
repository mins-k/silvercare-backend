const { chatWithGPT } = require('./openaiService');

exports.tagProfile = async ({ age, address, householdType, income, healthStatus }) => {
  const system = {
    role: 'system',
    content:
      '당신은 노인 복지 전문가입니다. 아래 사용자 정보를 보고 한국어로 복지사업 태그 3~6개를 JSON 배열로만 반환하세요.'
  };
  const user = {
    role: 'user',
    content: `나이: ${age}
주소: ${address}
가구 형태: ${householdType}
월 소득(원): ${income}
건강 상태: ${healthStatus}`
  };

  const reply = await chatWithGPT([system, user]);

  try {
    const arr = JSON.parse(reply);
    if (Array.isArray(arr)) return arr.map((t) => String(t).trim()).filter(Boolean);
  } catch (_) {
    // fallback
  }

  return reply
    .replace(/[\[\]]/g, '')
    .split(/,|\n/)
    .map((t) => t.trim())
    .filter(Boolean);
};