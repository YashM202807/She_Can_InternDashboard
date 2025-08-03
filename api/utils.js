module.exports = {
  corsHeaders: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  },

  calculateRewards: (donationsRaised) => {
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
  },

  parseBody: (req) => new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        resolve({});
      }
    });
  })
};
