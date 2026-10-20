require('dotenv').config();
const tmi = require('tmi.js');
const web = require('./web');
const cmds = require('./cmds/list');
const { isCd, getCd, setCd } = require('./cmds/cd');
const { getCmdFromDB, defaultCd } = require('./cmds/db');
const { noteRoom, resolveRooms } = require('./utils/sharedChat');

const cds = {};

const opts = {
  identity: {
    username: process.env.BOT_USERNAME,
    password: process.env.OAUTH_TOKEN
  },
  channels: process.env.CHANNEL_LIST ? process.env.CHANNEL_LIST.split(',') : [],
  joinInterval: 3000,
};

const client = new tmi.client(opts);
client.on('message', onMsg);
client.on('connected', onConnect);
client.on('roomstate', (channel, tags) => noteRoom(channel, tags['room-id']));
client.connect();

async function resolveAlias(target, msg, depth = 0) {
  if (depth > 5) return msg; // Prevent infinite loops
  const cmd = msg.trim().split(' ')[0].toLowerCase();
  try {
    const dbCmd = await getCmdFromDB(target, cmd);
    if (dbCmd?.response?.startsWith('!')) {
      const newMsg = msg.replace(new RegExp(`^${cmd}`, 'i'), dbCmd.response.trim());
      return resolveAlias(target, newMsg, depth + 1);
    }
  } catch (err) {
    console.error('Alias resolution error:', err.message);
  }
  return msg;
}

async function onMsg(target, ctx, msg, self) {
  if (self) return;

  // Shared Chat copies each message into every channel in the session, so only
  // one copy is acted on. Commands stay in the channel the message was sent
  // from, which is nothing for the bot to do if it is not in that channel.
  const rooms = resolveRooms(target, ctx);
  if (!rooms) return;
  target = rooms.origin;

  const user = ctx.username;
  if (target) msg = await resolveAlias(target, msg);
  const cmd = msg.trim().split(' ')[0].toLowerCase();

  // First: Try built-in commands
  if (cmds[cmd]) {
    const data = cmds[cmd];
    // Shared commands run once for the whole session instead of per channel.
    if (data.shared) target = rooms.session;
    if (!target) return;
    if (data.cd && isCd(target, user, cmd, cds)) {
      const timeLeft = getCd(target, user, cmd, cds);
      return sendMsg(target, `@${user}, ${cmd} is on cooldown for ${timeLeft}s.`);
    }
    data.run(target, client, ctx, msg, cds, (reply) => sendMsg(target, reply));
    if (data.cd) setCd(target, user, cmd, cds, data.cdTime);
    console.log(`* Ran ${cmd}`);
    return;
  }

  // Then: Try database commands
  if (!target) return;
  try {
    const dbCmd = await getCmdFromDB(target, cmd);
    if (dbCmd) {
      if (isCd(target, user, cmd, cds)) return;
      const response = dbCmd.response;
      if (response) {
        sendMsg(target, response);
        setCd(target, user, cmd, cds, defaultCd);
        console.log(`* Ran ${cmd} (DB)`);
      } else {
        console.warn(`No response text found for DB command: ${cmd}`);
      }
    }
  } catch (err) {
    console.error('DB Err:', err.message);
  }
}

function onConnect(addr, port) {
  console.log(`* Conn: ${addr}:${port}`);
}

function sendMsg(target, msg) {
  if (!target || typeof target !== 'string') {
    console.error('Invalid target passed to sendMsg:', target);
    return;
  }
  try {
    client.say(target, msg);
  } catch (err) {
    console.error('Send Err:', err.message);
  }
}
