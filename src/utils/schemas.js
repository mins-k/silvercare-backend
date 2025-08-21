const { z } = require('zod');

exports.profileInput = z.object({
  아이디: z.string().min(1),
  주민등록번호: z.string().regex(/^\d{6}-\d{7}$/, '주민등록번호 형식이 올바르지 않습니다.'),
  거주지주소: z.string().min(2),
  소득재산수준: z.coerce.number().nonnegative(),
  건강보험자격유형: z.string().min(1),
  가족구성: z.enum(['ALONE', 'COUPLE', 'MULTI', 'ETC'])
});