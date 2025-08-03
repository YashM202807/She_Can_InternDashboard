const { parse } = require('url');

const interns = require('./data');
const { calculateRewards, parseBody, corsHeaders } = require('./utils');

module.exports = async (req, res) => {
  Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const { pathname } = parse(req.url, true);

  // GET all interns
  if (pathname === '/api/interns' && req.method === 'GET') {
    const result = interns.map(({ password, ...i }) => ({
      ...i,
      ...calculateRewards(i.donationsRaised)
    }));
    return res.end(JSON.stringify(result));
  }

  // GET referral suggestions
  if (pathname === '/api/suggest-referral' && req.method === 'GET') {
    const usedCodes = interns.map(i => i.referralCode.toLowerCase());
    const currentYear = new Date().getFullYear();
    const suggestions = [
      `code${Math.floor(1000 + Math.random() * 9000)}`,
      `ref${currentYear}`,
      `intern${Math.floor(100 + Math.random() * 900)}`,
      `join${currentYear}`,
      `team${Math.floor(10 + Math.random() * 90)}`
    ].filter(code => !usedCodes.includes(code.toLowerCase()));

    return res.end(JSON.stringify({ suggestions: suggestions.slice(0, 5) }));
  }

  // PUT referral code update
  const referralMatch = pathname.match(/^\/api\/interns\/(\d+)\/referral$/);
  if (referralMatch && req.method === 'PUT') {
    const id = parseInt(referralMatch[1]);
    const intern = interns.find(i => i.id === id);
    if (!intern) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ message: 'Intern not found' }));
    }

    const { referralCode } = await parseBody(req);
    const newCode = referralCode?.trim();

    if (!newCode || newCode.length < 4 || newCode.length > 20) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ message: 'Referral code must be 4-20 characters' }));
    }

    const duplicate = interns.some(i =>
      i.referralCode.toLowerCase() === newCode.toLowerCase() && i.id !== id
    );
    if (duplicate) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ message: 'Referral code already taken' }));
    }

    intern.referralCode = newCode;
    const { password, ...updatedIntern } = intern;
    return res.end(JSON.stringify({ ...updatedIntern, ...calculateRewards(intern.donationsRaised) }));
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ message: 'Route not found' }));
};
