const {
  listPolicies,
  savePolicy,
  updatePolicy,
  deletePolicy
} = require('../models/policyModel');

const conditionKeyMap = {
  minAge:          '최소연령',
  maxAge:          '최대연령',
  minIncome:       '최소소득',
  maxIncome:       '최대소득',
  householdType:   '가구유형',
  occupation:      '직업',
  minCareerYears:  '경력(년)',
  healthCondition: '건강상태',
  residenceType:   '거주지역'
};


const conditionValueMap = {

  rural: '농촌',
  urban: '도시',
  farmer: '농업인',
  dementia: '치매 진단자',
  ALONE:  '1인 가구',
  COUPLE: '2인 가구',
  MULTI:  '다인 가구'
};

function mapConditions(raw = {}) {
  const mapped = {};
  for (const [key, val] of Object.entries(raw)) {
    const label = conditionKeyMap[key] || key;
    let display = val;

    if (typeof val === 'string' && conditionValueMap[val] != null) {
      display = conditionValueMap[val];
    }

    mapped[label] = display;
  }
  return mapped;
}

function toAdminView(p) {
  return {
    정책ID:   p.policyId,
    제목:     p.title,
    설명:     p.description,
    조건:     mapConditions(p.conditions || {}),
    지원금:   `${Math.floor((p.supportAmount || 0) / 10000)}만원`,
    마감일:   p.deadline || '미정',
    대상지역: Array.isArray(p.targetRegions) && p.targetRegions.length > 0
      ? p.targetRegions.join(', ')
      : '전지역',
    태그: Array.isArray(p.tags) ? p.tags : []
  };
}

exports.getPolicies = async (_req, res) => {
  try {
    const raw = await listPolicies();
    const policies = raw.map(toAdminView);
    return res.json({ success: true, policies, count: policies.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
};


exports.createPolicy = async (req, res) => {
  try {
    const body = req.body || {};

    if (!body.policyId || !body.title) {
      return res.status(400).json({
        success: false,
        error: 'policyId와 title은 필수입니다.'
      });
    }
    const saved = await savePolicy(body);
    return res.status(201).json({ success: true, policy: saved });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.patchPolicy = async (req, res) => {
  try {
    const { policyId } = req.params;
    if (!policyId) {
      return res.status(400).json({ success: false, error: 'policyId 경로 파라미터가 필요합니다.' });
    }
    const updated = await updatePolicy(policyId, req.body || {});
    return res.json({ success: true, policy: updated });
  } catch (err) {
    console.error(err);
    const status = /찾을 수 없습니다/.test(err.message) ? 404 : 400;
    return res.status(status).json({ success: false, error: err.message });
  }
};

exports.removePolicy = async (req, res) => {
  try {
    const { policyId } = req.params;
    if (!policyId) {
      return res.status(400).json({ success: false, error: 'policyId 경로 파라미터가 필요합니다.' });
    }
    const out = await deletePolicy(policyId);
    return res.json({ success: true, ...out });
  } catch (err) {
    console.error(err);
    const status = /찾을 수 없습니다/.test(err.message) ? 404 : 400;
    return res.status(status).json({ success: false, error: err.message });
  }
};