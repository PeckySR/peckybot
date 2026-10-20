// stream.js

const { setTitle, setGame, getGameId } = require('../data/streamUpdater');
const { sanitizeInput } = require('../utils/sanitizer');
const { hasPerm } = require('../utils/permissions');

// Strip the command off the front however it was capitalised. server.js only
// lowercases the word it looks the command up by, not the message it passes on.
const argOf = (msg, cmd) =>
  sanitizeInput(msg).replace(new RegExp(`^${cmd}\\s*`, 'i'), '').trim();

// An axios error carries the whole request config, including the Authorization
// header, so pick out only the parts that are safe to log and repeat in chat.
const describeErr = (err) => {
  const detail = err.response?.data?.message || err.message;
  return err.response?.status ? `${err.response.status} ${detail}` : detail;
};

function changeTitle(target, client, ctx, msg) {
  try {
    const title = argOf(msg, '!changetitle');
    if (target === `#${process.env.CHANNEL_NAME1}`) {
      if (hasPerm(ctx)) {
        if (!title) {
          return client.say(target, `@${ctx.username} → Use: !changetitle <title>`);
        }
        setTitle(process.env.BROADCASTER_ID, title)
          .then(() => client.say(target, `@${ctx.username} → Title updated: ${title}`))
          .catch(err => {
            console.error('Title update error:', describeErr(err));
            client.say(target, `@${ctx.username} → Could not update title: ${describeErr(err)}`);
          });
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
    const game = argOf(msg, '!changegame');
    if (target === `#${process.env.CHANNEL_NAME1}`) {
      if (hasPerm(ctx)) {
        if (!game) {
          return client.say(target, `@${ctx.username} → Use: !changegame <game>`);
        }
        getGameId(game)
          .then(gameId => setGame(process.env.BROADCASTER_ID, gameId))
          .then(() => client.say(target, `@${ctx.username} → Game updated: ${game}`))
          .catch(err => {
            console.error('Game update error:', describeErr(err));
            client.say(target, `@${ctx.username} → Could not update game: ${describeErr(err)}`);
          });
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
