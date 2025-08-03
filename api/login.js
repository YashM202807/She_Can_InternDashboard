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

  if (pathname === '/api/login' && req.method === 'POST') {
    const { username, password } = await parseBody(req);

    // Check if username exists in the dataset
    let intern = interns.find(i => i.name.toLowerCase() === username?.toLowerCase());

    // If not found, create a dummy intern object
    if (!intern) {
      intern = {
        id: Date.now(), // random ID
        name: username || 'Guest User',
        referralCode: 'guest2025',
        donationsRaised: 0,
        university: 'N/A',
        password: password || '',
      };
    }

    const { password: _, ...internData } = intern;

    return res.end(JSON.stringify({ ...internData, ...calculateRewards(intern.donationsRaised) }));
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ message: 'Route not found' }));
};
