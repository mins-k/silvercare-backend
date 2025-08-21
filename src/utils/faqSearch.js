const fs = require('fs');
const path = require('path');

const FAQ_PATH = path.join(__dirname, '..', '..', 'data', 'faq.json');
let FAQ = [];
try { FAQ = JSON.parse(fs.readFileSync(FAQ_PATH, 'utf-8')); } catch { FAQ = []; }

function score(q, query) {
  const t = (q.q + ' ' + q.a).toLowerCase();
  const qq = String(query).toLowerCase().split(/\s+/).filter(Boolean);
  return qq.reduce((acc, kw) => acc + (t.includes(kw) ? 1 : 0), 0);
}

exports.searchFAQ = (query, limit = 5) => {
  const ranked = FAQ.map(item => ({ ...item, _s: score(item, query) }))
                    .filter(x => x._s > 0)
                    .sort((a,b)=> b._s - a._s);
  return ranked.slice(0, limit).map(({_s, ...rest}) => rest);
};