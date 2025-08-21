const { saveProfile, getProfile } = require('../models/profileModel');
const { tagProfile } = require('../services/taggingService');
const { profileInput } = require('../utils/schemas');
const { deriveBirthDateFromRRN } = require('../utils/derive');


exports.submitProfile = async (req, res) => {
  try {
    const parsed = profileInput.parse(req.body);

    const {
      아이디: userId,
      주민등록번호: rrn,
      거주지주소,
      소득재산수준,
      건강보험자격유형,
      가족구성
    } = parsed;

    const { birthDate, age } = deriveBirthDateFromRRN(rrn);

    const canonical = {
      id: userId,
      birthDate,  
      age,                   
      address:       거주지주소,
      householdType: 가족구성, 
      income:        Number(소득재산수준),
      healthStatus:  건강보험자격유형
    };

    const tags = await tagProfile(canonical);
    const saved = await saveProfile({ ...canonical, tags });

    return res.json({
      success: true,
      프로필: {
        아이디: saved.id,
        생년월일: saved.birthDate,
        나이: saved.age,
        거주지주소: saved.address,
        소득재산수준: saved.income,
        건강보험자격유형: saved.healthStatus,
        가족구성: saved.householdType,
        태그: saved.tags,
        생성일시: saved.createdAt
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ success: false, error: err.message });
  }
};