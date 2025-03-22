// randrunner.js

const { sanitizeInput } = require('../../utils/sanitizer');
const { Random } = require('random-js');
const { runners } = require('../../data/words');

const random = new Random();

// Function to get a random runner
const getRandomRunner = () => runners[random.integer(0, runners.length - 1)];

// Function called when the "!randrunner" command is used
const randrunner = (target, client, ctx, msg) => {
  const sanitizedMsg = sanitizeInput(msg);
  const runner = getRandomRunner();

  client.say(target, `${runner}`);

  const userGuess = sanitizedMsg.replace(/^!randrunner\s+/, "").toLowerCase();
  if (userGuess === sanitizeInput(runner.toLowerCase())) {
    client.say(target, `@${ctx.username} Congrats, you won randrunner!`);
  }
};

module.exports = { randrunner };
