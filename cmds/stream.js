// stream.js

const { setTitle, setGame, getGameId } = require('../data/streamUpdater');
const { sanitizeInput } = require('../utils/sanitizer');
const { hasPerm } = require('../utils/permissions');

function changeTitle(target, client, ctx, msg) {
  try {
    const title = sanitizeInput(msg).replace(/^!changetitle\s+/, '');
    if (target === `#${process.env.CHANNEL_NAME1}`) {
      if (hasPerm(ctx)) {
        setTitle(process.env.BROADCASTER_ID, title)
          .then(() => client.say(target, `@${ctx.username} → Title updated: ${title}`))
          .catch(err => console.error('Title update error:', err));
      } else {
        client.say(target, `@${ctx.username} no perms.`);
      }
    }
  } catch (err) {
    console.error('Title command error:', err.message);
    client.say(target, `@${ctx.username} → Error updating title.`);
  }
}

function changeGame(target, client, ctx, msg) {
  try {
    const game = sanitizeInput(msg).replace(/^!changegame\s+/, '');
    if (target === `#${process.env.CHANNEL_NAME1}`) {
      if (hasPerm(ctx)) {
        getGameId(game)
          .then(gameId => setGame(process.env.BROADCASTER_ID, gameId))
          .then(() => client.say(target, `@${ctx.username} → Game updated: ${game}`))
          .catch(err => console.error('Game update error:', err));
      } else {
        client.say(target, `@${ctx.username} no perms.`);
      }
    }
  } catch (err) {
    console.error('Game command error:', err.message);
    client.say(target, `@${ctx.username} → Error updating game.`);
  }
}

module.exports = { changeTitle, changeGame };
