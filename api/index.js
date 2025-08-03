const { parse } = require('url');

// Dummy data (normally you'd put this in a separate file)
const interns = [
  { id: 1, name: "Priya Patel", referralCode: "priya2025", donationsRaised: 1500, university: "Delhi Technical University", password: "password123" },
  { id: 2, name: "Wei Chen", referralCode: "wei2025", donationsRaised: 2200, university: "Tsinghua University", password: "password123" },
  { id: 3, name: "Fatima Al-Mansoori", referralCode: "fatima2025", donationsRaised: 1800, university: "American University of Sharjah", password: "password123" },
  { id: 4, name: "Kwame Nkrumah", referralCode: "kwame2025", donationsRaised: 950, university: "University of Ghana", password: "password123" },
  { id: 5, name: "Sophie Dubois", referralCode: "sophie2025", donationsRaised: 3200, university: "Sorbonne University", password: "password123" },
  { id: 6, name: "Alejandro Ruiz", referralCode: "alejandro2025", donationsRaised: 1250, university: "Universidad Nacional Autónoma de México", password: "password123" },
  { id: 7, name: "Yuki Tanaka", referralCode: "yuki2025", donationsRaised: 2750, university: "University of Tokyo", password: "password123" },
  { id: 8, name: "Olivia Smith", referralCode: "olivia2025", donationsRaised: 1950, university: "Harvard University", password: "password123" },
  { id: 9, name: "Mohammed Khan", referralCode: "mohammed2025", donationsRaised: 1100, university: "Lahore University of Management Sciences", password: "password123" },
  { id: 10, name: "Anastasia Petrov", referralCode: "anastasia2025", donationsRaised: 2400, university: "Moscow State University", password: "password123" },
  { id: 11, name: "Yash", referralCode: "yash2025", donationsRaised: 1000, university: "Demo University", password: "yash" },
  { id: 12, name: "Liam Johnson", referralCode: "liam2025", donationsRaised: 3100, university: "University of Toronto", password: "password123" },
  { id: 13, name: "Amara Singh", referralCode: "amara2025", donationsRaised: 800, university: "IIT Bombay", password: "password123" },
  { id: 14, name: "Carlos Fernandez", referralCode: "carlos2025", donationsRaised: 2700, university: "University of São Paulo", password: "password123" },
  { id: 15, name: "Emily Thompson", referralCode: "emily2025", donationsRaised: 1450, university: "University of Sydney", password: "password123" },
  { id: 16, name: "Chen Liu", referralCode: "chen2025", donationsRaised: 3500, university: "Peking University", password: "password123" },
  { id: 17, name: "Noah Müller", referralCode: "noah2025", donationsRaised: 700, university: "ETH Zurich", password: "password123" },
  { id: 18, name: "Isabella Rossi", referralCode: "isabella2025", donationsRaised: 2250, university: "University of Bologna", password: "password123" },
  { id: 19, name: "Ahmed El-Sayed", referralCode: "ahmed2025", donationsRaised: 1800, university: "Cairo University", password: "password123" },
  { id: 20, name: "Saanvi Sharma", referralCode: "saanvi2025", donationsRaised: 2950, university: "University of Melbourne", password: "password123" }
];

function calculateRewards(donationsRaised) {
  const thresholds = [
    { amount: 750, reward: "Starter Pack" },
    { amount: 1500, reward: "Early Access" },
    { amount: 2250, reward: "VIP Access" },
    { amount: 3000, reward: "Mentorship Program" }
  ];
  const rewards = thresholds.filter(t => donationsRaised >= t.amount).map(t => t.reward);
  const next = thresholds.find(t => donationsRaised < t.amount);
  return {
    rewards,
    nextReward: next?.reward || null,
    nextRewardAmount: next?.amount || null
  };
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        resolve({});
      }
    });
  });
}

module.exports = async (req, res) => {
  const { pathname } = parse(req.url, true);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  // GET /api/interns
  if (pathname === '/api/interns' && req.method === 'GET') {
    const result = interns.map(({ password, ...i }) => ({
      ...i,
      ...calculateRewards(i.donationsRaised)
    }));
    return res.end(JSON.stringify(result));
  }

  // POST /api/login
  if (pathname === '/api/login' && req.method === 'POST') {
    const { username, password } = await parseBody(req);
    const intern = interns.find(i =>
      i.name.toLowerCase() === username?.toLowerCase() && i.password === password
    );
    if (!intern) {
      res.statusCode = 401;
      return res.end(JSON.stringify({ message: 'Invalid credentials' }));
    }
    const { password: _, ...internData } = intern;
    return res.end(JSON.stringify({ ...internData, ...calculateRewards(intern.donationsRaised) }));
  }

  // GET /api/suggest-referral
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

  // PUT /api/interns/:id/referral
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

  // Default 404
  res.statusCode = 404;
  res.end(JSON.stringify({ message: 'Route not found' }));
};
