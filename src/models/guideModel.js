const fs = require('fs');
const path = require('path');
const PATH = path.join(__dirname, '..', '..', 'data', 'guides.json');
let guides = [];
try { guides = JSON.parse(fs.readFileSync(PATH, 'utf-8')); } catch { guides = []; }

exports.getGuide = async (policyId) => guides.find(g => String(g.policyId) === String(policyId));