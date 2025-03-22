// cd.js

// Check if user is on cooldown for a command
const isCd = (user, cmd, cds) => {
  const cd = cds[cmd]?.[user];
  return cd ? new Date() - cd.ts < cd.dur : false;
};

// Get remaining cooldown time for a user and command
const getCd = (user, cmd, cds) => {
  const cd = cds[cmd]?.[user];
  return cd ? Math.ceil((cd.dur - (new Date() - cd.ts)) / 1000) : 0;
};

// Set a cooldown for a user on a command
const setCd = (user, cmd, cds, dur) => {
  if (!cds[cmd]) cds[cmd] = {};
  cds[cmd][user] = { ts: new Date(), dur: dur * 1000 };
};

module.exports = { isCd, getCd, setCd };
