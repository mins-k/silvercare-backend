const path = require('path');
const fs   = require('fs');
const { normalizePolicy } = require('../utils/normalize');

const DATA_PATH = path.join(__dirname, '..', '..', 'data', 'samplePolicies.json');

let policies = [];
try {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  const arr = JSON.parse(raw);
  policies = arr.map(normalizePolicy);
  console.log(`✅ Loaded ${policies.length} policies (normalized)`);
} catch (err) {
  console.error('⚠️ samplePolicies.json 로드 실패:', err);
  policies = [];
}

exports.listPolicies = async () => policies;

exports.savePolicy = async (policy) => {
  const normalized = normalizePolicy(policy);
  policies.push(normalized);

  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(policies, null, 2), 'utf-8');
    console.log(`✅ 정책 ${normalized.policyId} 저장(정규화됨)`);
  } catch (err) {
    console.error('⚠️ samplePolicies.json 저장 실패:', err);
  }
  return normalized;
};
exports.updatePolicy = async (policyId, patch) => {
  const idx = policies.findIndex(p => String(p.policyId) === String(policyId));
  if (idx === -1) throw new Error('정책을 찾을 수 없습니다.');
  policies[idx] = { ...policies[idx], ...patch, updatedAt: new Date().toISOString() };
  fs.writeFileSync(DATA_PATH, JSON.stringify(policies, null, 2), 'utf-8');
  return policies[idx];
};

exports.deletePolicy = async (policyId) => {
  const before = policies.length;
  policies = policies.filter(p => String(p.policyId) !== String(policyId));
  if (policies.length === before) throw new Error('정책을 찾을 수 없습니다.');
  fs.writeFileSync(DATA_PATH, JSON.stringify(policies, null, 2), 'utf-8');
  return { deleted: true };
};