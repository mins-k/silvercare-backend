exports.deriveBirthDateFromRRN = (rrn) => {
  const [ymd, tail] = String(rrn).split('-');
  if (!ymd || !tail || ymd.length !== 6) {
    throw new Error('주민등록번호 형식이 올바르지 않습니다.');
  }
  const yy = parseInt(ymd.slice(0, 2), 10);
  const mm = ymd.slice(2, 4);
  const dd = ymd.slice(4, 6);

  const seventh = tail[0];
  const century = ['1', '2', '5', '6'].includes(seventh) ? 1900 : 2000;
  const yyyy = century + yy;

  const birthDate = `${yyyy}-${mm}-${dd}`;
  const age = Math.floor((Date.now() - new Date(birthDate).getTime()) / (365.25 * 24 * 3600 * 1000));
  return { birthDate, age };
};