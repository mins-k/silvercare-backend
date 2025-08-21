const norm = (s='') => s.toLowerCase().replace(/\s+/g,'').trim();

function detectIntent(text='') {
  const t = norm(text);
  if (/(정책|혜택|지원|복지).*(알려줘|추천|받을수|받을수있)/.test(t)) return 'recommend';
  if (/(내가|지금).*(받을수|받을수있).*(정책|혜택)/.test(t)) return 'recommend';
  if (/(신청|절차|서류|방법|어떻게)/.test(t)) return 'faq';
  if (/(주소|소득|가구|건강보험|정보).*(변경|수정|바꿔)/.test(t)) return 'profile_update';
  if (/(진행|상태|확인).*(신청|접수)/.test(t)) return 'status';
  if (/(안녕|고마워|감사|날씨|반가)/.test(t)) return 'smalltalk';
  return 'unknown';
}

module.exports = { detectIntent };