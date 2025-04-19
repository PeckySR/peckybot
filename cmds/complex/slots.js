// slots.js

const { Random } = require('random-js');

const emotes = [
  'Kappa', 'peckys1Wut', 'peckys1Smug', 'peckys1Wave', '4Head', 'cmonBruh',
  'sternp3Piloswine', 'ImTyping', 'NotLikeThis', 'WhySoSerious', 'Poooound',
  'Jebaited', 'MrDestructoid', 'GivePLZ', 'HeyGuys', 'lionhe77Arrive',
  'SwiftRage', 'Kreygasm', 'VoHiYo', 'sternp3Hiiiiiiiii', 'DarkKnight', 'ResidentSleeper',
  'SeemsGood', 'WutFace', 'TheIlluminati', 'GlitchCat', 'lionhe77RIP',
  'SourPls', 'DinoDance', 'sternp3Kingdra', 'sternp3Mew', 'lionhe77AAAA', 
  'lionhe77Swag', 'lionhe77Hype', 'lionhe77Wave', 'lionhe77Peets', 'lionhe77NT',
  'lionhe77Wink', 'lionhe77Blep', 'lionhe77Lockin'
];

const random = new Random();

const slots = (target, client, ctx) => {
  const rolled = Array.from({ length: 3 }, () => {
    return emotes[random.integer(0, emotes.length - 1)];
  });

  const result = rolled.join(' | ');
  client.say(target, `@${ctx.username} → ${result}`);

  if (rolled.every(emote => emote === rolled[0])) {
    client.say(target, `@${ctx.username} → Congrats, you won slots!`);
  }
};

module.exports = { slots };