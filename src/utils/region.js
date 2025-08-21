const SIDO_ALIASES = [
  { code: '서울', names: ['서울특별시', '서울시', '서울'] },
  { code: '부산', names: ['부산광역시', '부산시', '부산'] },
  { code: '대구', names: ['대구광역시', '대구시', '대구'] },
  { code: '인천', names: ['인천광역시', '인천시', '인천'] },
  { code: '광주', names: ['광주광역시', '광주시', '광주'] },
  { code: '대전', names: ['대전광역시', '대전시', '대전'] },
  { code: '울산', names: ['울산광역시', '울산시', '울산'] },
  { code: '세종', names: ['세종특별자치시', '세종시', '세종'] },
  { code: '경기', names: ['경기도', '경기'] },
  { code: '강원', names: ['강원특별자치도', '강원도', '강원'] },
  { code: '충북', names: ['충청북도', '충북'] },
  { code: '충남', names: ['충청남도', '충남'] },
  { code: '전북', names: ['전북특별자치도', '전라북도', '전북'] },
  { code: '전남', names: ['전라남도', '전남'] },
  { code: '경북', names: ['경상북도', '경북'] },
  { code: '경남', names: ['경상남도', '경남'] },
  { code: '제주', names: ['제주특별자치도', '제주도', '제주'] }
];

const SIDO_REGEX = new RegExp(
  '^(' +
    SIDO_ALIASES
      .flatMap(s => s.names)
      .map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|') +
  ')'
);

/** 시군구 별칭 보정 (필요한 케이스만 확장) */
function normalizeSgg(sggRaw = '') {
  let s = sggRaw;
  if (/대천/.test(s)) s = '보령시';
  if (!/(시|군|구)$/.test(s) && /[가-힣]+/.test(s)) {
    s = s + '군';
  }
  return s;
}

/**
 * 주소에서 시도/시군구를 추출하고 표준화
 * @param {string} address 전체 주소 문자열
 * @returns {{
 *   code: string|null,
 *   sido: string|null,
 *   sgg: string|null,       
 *   raw: string
 * }}
 */
exports.detectRegion = (address = '') => {
  const raw = String(address || '').trim();
  if (!raw) return { code: null, sido: null, sgg: null, raw };

  const text = raw.replace(/\s+/g, ' ');

  let code = null;
  let sido = null;

  const mSido = text.match(SIDO_REGEX);
  if (mSido) {
    const sidoHit = mSido[1];
    for (const s of SIDO_ALIASES) {
      if (s.names.includes(sidoHit)) {
        code = s.code;
        sido = s.names[0];
        break;
      }
    }
  }

  let sgg = null;
  if (mSido) {
    const rest = text.slice(mSido[0].length).trim();
    const mSgg = rest.match(/([가-힣]+(?:시|군|구))/);
    if (mSgg) sgg = mSgg[1];
  } else {
    const mSggOnly = text.match(/([가-힣]+(?:시|군|구))/);
    if (mSggOnly) sgg = mSggOnly[1];
  }

  if (sgg) sgg = normalizeSgg(sgg);

  return { code, sido, sgg, raw };
};

/**
 * 편의: 특정 지역(예: '청양' '서산' '보령/대천') 판별이 필요할 때 사용
 * @param {string} address
 * @returns {'청양'|'서산'|'보령(대천)'|'기타'}
 */
exports.detectLocalShortcut = (address = '') => {
  const txt = String(address || '');
  if (/(청양군|청양)/.test(txt)) return '청양';
  if (/(서산시|서산)/.test(txt)) return '서산';
  if (/(보령시|대천)/.test(txt)) return '보령(대천)';
  return '기타';
};