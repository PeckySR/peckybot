// roll.js

const { sanitizeInput } = require('../../utils/sanitizer');
const { Random } = require('random-js');

const random = new Random();

const roll = (target, client, ctx, msg) => {
  const input = sanitizeInput(msg).trim();
  const parts = input.split(/\s+/); // split on spaces
  const username = ctx.username;

  // Default max value
  const maxParsed = parseInt(parts[1], 10); // try to get max from second word
  const rollMax = (!isNaN(maxParsed) && maxParsed > 0) ? maxParsed : 100;

  const finalRoll = random.integer(1, rollMax);

  client.say(target, `@${ctx.username} ${finalRoll}`);
};

module.exports = { roll };
