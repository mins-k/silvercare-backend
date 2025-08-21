const { listPolicies } = require('../models/policyModel');
const { getProfile } = require('../models/profileModel');
const { detectRegion } = require('../utils/region');
const W = { fit: 0.5, amount: 0.3, urgency: 0.2 };

exports.matchPolicies = async (userId) => {
  const profile = await getProfile(userId);
  if (!profile) throw new Error('프로필을 찾을 수 없습니다.');

  const region = detectRegion(profile.address || '');
  const tags = Array.isArray(profile.tags) ? profile.tags : [];

  const policies = await listPolicies();
  const now = Date.now();

  const candidates = [];

  for (const p of policies) {
    const c = p.conditions || {};
    if (Array.isArray(p.targetRegions) && p.targetRegions.length > 0) {
      if (!p.targetRegions.includes(region)) continue;
    }

    if (p.deadlineEpoch && p.deadlineEpoch < now) continue;
    if (c.minAge != null && profile.age < c.minAge) continue;
    if (c.maxAge != null && profile.age > c.maxAge) continue;
    if (c.minIncome != null && profile.income < c.minIncome) continue;
    if (c.maxIncome != null && profile.income > c.maxIncome) continue;
    if (c.householdType && profile.householdType !== c.householdType) continue;
    if (c.healthCondition && c.healthCondition !== profile.healthStatus) continue;
    if (c.occupation && c.occupation !== profile.occupation) {
    }

    const overlap = p.tags?.length
      ? p.tags.filter(t => tags.includes(t)).length / p.tags.length
      : 0; 
    const ageSlack = (() => {
      if (c.minAge != null && c.maxAge != null) {
        const mid = (c.minAge + c.maxAge) / 2;
        const span = Math.max(1, c.maxAge - c.minAge);
        return 1 - Math.min(1, Math.abs(profile.age - mid) / (span / 2));
      }
      return 0.5;
    })();

    const incomeSlack = (() => {
      if (c.maxIncome != null) {
        const ratio = Math.min(1, (profile.income || 0) / Math.max(1, c.maxIncome));
        return 1 - ratio; // 0~1
      }
      return 0.5;
    })();

    const fit = Math.max(0, Math.min(1, 0.6 * overlap + 0.2 * ageSlack + 0.2 * incomeSlack));
    const amountScore = Math.max(0, Math.min(1, (p.supportAmount || 0) / 1000000)); 
    const urgency = (() => {
      if (!p.deadlineEpoch) return 0;
      const days = (p.deadlineEpoch - now) / (1000 * 60 * 60 * 24);
      return Math.max(0, Math.min(1, 1 - days / 30));
    })();

    const score = W.fit * fit + W.amount * amountScore + W.urgency * urgency;

    candidates.push({
      ...p,
      regionMatched: region,
      score,
      _fit: Number(fit.toFixed(3)),
      _amountScore: Number(amountScore.toFixed(3)),
      _urgency: Number(urgency.toFixed(3))
    });
  }

  candidates.sort((a, b) => b.score - a.score);

  return candidates;
};