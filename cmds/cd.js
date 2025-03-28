// cd.js

// Check if user is on cooldown for a command in a specific channel
const isCd = (target, user, cmd, cds) => {
  const cd = cds[target]?.[cmd]?.[user];
  return cd ? new Date() - cd.ts < cd.dur : false;
};

// Get remaining cooldown time for a user and command in a specific channel
const getCd = (target, user, cmd, cds) => {
  const cd = cds[target]?.[cmd]?.[user];
  return cd ? Math.ceil((cd.dur - (new Date() - cd.ts)) / 1000) : 0;
};

// Set a cooldown for a user on a command in a specific channel
const setCd = (target, user, cmd, cds, dur) => {
  if (!cds[target]) cds[target] = {};
  if (!cds[target][cmd]) cds[target][cmd] = {};
  cds[target][cmd][user] = { ts: new Date(), dur: dur * 1000 };
};

module.exports = { isCd, getCd, setCd };
