// roll.js

const { sanitizeInput } = require('../../utils/sanitizer');
const { Random } = require('random-js');

const random = new Random();

const roll = (target, client, ctx, msg) => {
  const input = sanitizeInput(msg).replace(/^!roll\s+/, '').trim();
  console.log(input);
  const max = Number(input);
  console.log(max);

  if (!max || isNaN(max) || max < 1) {
    return client.say(target, `@${ctx.username} Usage: !roll <max>`);
  }

  const result = random.integer(1, max);
  client.say(target, `@${ctx.username} ${result}`);
};

module.exports = { roll };
