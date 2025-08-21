const fs = require('fs');
const path = require('path');

const POLICIES = path.join(__dirname, '..', 'data', 'samplePolicies.json');
const OUT = path.join(__dirname, '..', 'data', 'guides.json');

const TPL = {
  DEFAULT: {
    steps: [
      '주소지 읍·면·동 주민센터 또는 담당 부서에 문의/방문합니다.',
      '신분증과 통장사본, 해당 정책에 필요한 증빙서류를 준비합니다.',
      '신청서 작성 후 접수합니다.',
      '접수증을 보관하고 결과를 문자/전화로 안내받습니다.'
    ],
    docs: ['신분증', '통장사본', '주소지 확인서류(등본/초본 등)'],
  },
  HEALTH_SUPPORT: {
    steps: ['보건소/지정의료기관에 문의합니다.', '의사 소견서/진단서 등 의료서류를 준비합니다.', '신청서 제출 후 결과 안내를 기다립니다.'],
    docs: ['신분증', '진단서/소견서', '건강보험 자격 확인서(필요 시)']
  },
  DENTAL: {
    steps: ['지정 치과 또는 보건소에 상담합니다.', '견적/의료서류를 준비합니다.', '신청서 제출 후 승인 알림을 기다립니다.'],
    docs: ['신분증', '진단서/치료계획서', '견적서(필요 시)']
  },
  ENERGY_SUPPORT: {
    steps: ['주민센터 복지팀에 방문/전화합니다.', '소득 확인 및 난방비 고지서 등을 준비합니다.', '신청서 제출 후 바우처/지원 안내를 받습니다.'],
    docs: ['신분증', '소득(또는 기초수급) 증빙', '최근 고지서(전기/난방 등)']
  },
  HOUSING_REPAIR: {
    steps: ['주거환경 개선 신청 상담(군청/구청 주택과/복지과).', '대상자 조사/현장 확인을 받습니다.', '공사 일정 안내 후 진행합니다.'],
    docs: ['신분증', '주택 소유/임대 관련 서류', '소득 증빙']
  },
  TRANSPORT: {
    steps: ['읍·면사무소나 담당 부서로 신청합니다.', '이동 불편 사유 확인(의사 소견 등)을 제출합니다.', '이용 일정/방법을 안내받습니다.'],
    docs: ['신분증', '이동불편 관련 확인서(있으면)']
  },
  SAFETY_DEVICE: {
    steps: ['주민센터/노인맞춤돌봄 담당자에게 문의합니다.', '설치 대상 확인 후 일정 조율합니다.', '기기 설치 및 사용법 안내를 받습니다.'],
    docs: ['신분증', '독거/돌봄 필요 확인(해당 시)']
  },
  RESPITE: {
    steps: ['치매안심센터/주민센터에 문의합니다.', '진단서 및 가족 돌봄 확인서를 제출합니다.', '바우처 승인 후 이용기관을 안내받습니다.'],
    docs: ['신분증', '치매 진단서', '가족관계증명서(보호자)']
  }
};

function pickTemplateByTags(tags = []) {
  for (const t of tags) {
    if (TPL[t]) return TPL[t];
  }
  return TPL.DEFAULT;
}

function buildGuide(p) {
  const tpl = pickTemplateByTags(p.tags);
  return {
    policyId: p.policyId,
    title: p.title,
    steps: tpl.steps,
    documents: tpl.docs,
    contacts: {
      online: 'https://www.bokjiro.go.kr',
      office: '주소지 읍·면·동 주민센터 / 군청 복지과',
      phone: '지자체 대표번호 안내',
      address: '주소지 관할 행정복지센터'
    },
    note: '지역·소득·건강 요건에 따라 추가 서류가 필요할 수 있습니다.'
  };
}

function main() {
  const policies = JSON.parse(fs.readFileSync(POLICIES, 'utf-8'));
  const guides = policies.map(buildGuide);
  fs.writeFileSync(OUT, JSON.stringify(guides, null, 2), 'utf-8');
  console.log(`✅ guides.json written (${guides.length} items)`);
}
main();