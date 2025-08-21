const householdMap = new Map([
  ['1인 가구','ALONE'], ['1인가구','ALONE'], ['독거','ALONE'], ['독거노인','ALONE'],
  ['부부','COUPLE'], ['2인 가구','COUPLE'],
  ['다인 가구','MULTI'], ['3인 이상','MULTI'],
]);
const residenceMap = new Map([
  ['농촌','rural'], ['도시','urban'],
]);

function extractPolicyTags(title = '', description = '') {
  const t = (title + ' ' + description).toLowerCase();

  const tags = new Set();
  if (t.includes('기초연금')) tags.add('BASIC_PENSION');
  if (t.includes('건강검진') || t.includes('검진')) tags.add('HEALTH_CHECKUP');
  if (t.includes('경로당') || t.includes('식사')) tags.add('MEAL_SUPPORT');
  if (t.includes('주택') || t.includes('보수') || t.includes('수리')) tags.add('HOUSING_REPAIR');
  if (t.includes('치매')) tags.add('DEMENTIA');
  if (t.includes('농업') || t.includes('농민') || t.includes('농가') || t.includes('농업인')) tags.add('FARMER');

  return [...tags];
}

exports.normalizePolicy = (p0 = {}) => {
  const p = { ...p0 };
  const c = { ...(p.conditions || {}) };

  const supportAmount = Number(p.supportAmount || 0);
  const minAge = c.minAge != null ? Number(c.minAge) : undefined;
  const maxAge = c.maxAge != null ? Number(c.maxAge) : undefined;
  const minIncome = c.minIncome != null ? Number(c.minIncome) : undefined;
  const maxIncome = c.maxIncome != null ? Number(c.maxIncome) : undefined;
  let householdType = c.householdType;
  if (typeof householdType === 'string') {
    householdType = householdMap.get(householdType) || householdType;
  }
  let residenceType = c.residenceType;
  if (typeof residenceType === 'string') {
    residenceType = residenceMap.get(residenceType) || residenceType;
  }
  const deadline = p.deadline || null;
  const deadlineEpoch = deadline ? Date.parse(deadline) : null;
  const tags = Array.isArray(p.tags) ? p.tags : extractPolicyTags(p.title, p.description);
  const targetRegions = Array.isArray(p.targetRegions) ? p.targetRegions : undefined;

  return {
    policyId: String(p.policyId),
    title: p.title || '',
    description: p.description || '',
    supportAmount,
    deadline,
    deadlineEpoch,
    tags,
    targetRegions,
    conditions: {
      minAge, maxAge,
      minIncome, maxIncome,
      householdType,
      occupation: c.occupation,
      minCareerYears: c.minCareerYears != null ? Number(c.minCareerYears) : undefined,
      healthCondition: c.healthCondition,
      residenceType
    }
  };
};