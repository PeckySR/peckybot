// sroll.js

const { Random } = require('random-js');
const random = new Random();

const sroll = (target, client, ctx, msg) => {
  const roll = random.integer(1, 8192);
  const username = ctx.username;

  if (roll === 8192) {
    client.say(target, `@${username} ✨${roll}✨`);
  } else {
    client.say(target, `@${username} ${roll}`);
  }
};

module.exports = { sroll };
