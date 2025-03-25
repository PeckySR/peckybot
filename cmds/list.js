// list.js

const { hasPerm } = require('../utils/permissions');
const { addCmd, editCmd, delCmd, getCmds } = require('./db');
const { setTitle, setGame } = require('../data/streamUpdater');
const { getWR, getPB } = require('./complex/src');
const { slots } = require('./complex/slots');
const { handleHangman, setHangmanCooldown } = require('./complex/hangmanBot');
const { metronome } = require('./complex/metronome');
const { randmon } = require('./complex/randmon');
const { roll } = require('./complex/roll');
const { sroll } = require('./complex/sroll');
const { randrunner } = require('./complex/randrunner');
const { cmdList } = require('./simple/commands');

const cmds = {
  '!addcmd': {
    cd: false,
    run: (target, client, ctx, msg) => {
      if (hasPerm(ctx)) {
        addCmd(target, msg, ctx.username, (res) => client.say(target, res));
      } else {
        client.say(target, `@${ctx.username} no perms.`);
      }
    },
  },
  '!editcmd': {
    cd: false,
    run: (target, client, ctx, msg) => {
      if (hasPerm(ctx)) {
        editCmd(target, msg, ctx.username, (res) => client.say(target, res));
      } else {
        client.say(target, `@${ctx.username} no perms.`);
      }
    },
  },
  '!delcmd': {
    cd: false,
    run: (target, client, ctx, msg) => {
      if (hasPerm(ctx)) {
        delCmd(target, msg, ctx.username, (res) => client.say(target, res));
      } else {
        client.say(target, `@${ctx.username} no perms.`);
      }
    },
  },
  '!cmds': {
    cd: false,
    run: (target, client, ctx) => {
      if (hasPerm(ctx)) {
        getCmds(target, (err, names) => {
          const res = names.length ? `Cmds: ${names.join(', ')}` : `No cmds.`;
          client.say(target, res);
        });
      } else {
        client.say(target, `@${ctx.username} no perms.`);
      }
    },
  },
  '!changetitle': { cd: false, run: setTitle },
  '!changegame': { cd: false, run: setGame },
  '!getwr': {
    cd: false,
    run: async (target, client, ctx, msg) => {
      const args = msg.slice(6).trim().split(',');
      if (args.length < 2) {
        return client.say(target, 'Use: !getwr <game>, <cat>, <var0>/<var1>');
      }
      const res = await getWR(...args.map(arg => arg.trim()));
      client.say(target, res);
    },
  },
  '!getpb': {
    cd: false,
    run: async (target, client, ctx, msg) => {
      const args = msg.slice(6).trim().split(',');
      if (args.length < 3) {
        return client.say(target, 'Use: !getpb <game>, <cat>, <runner>');
      }
      const res = await getPB(...args.map(arg => arg.trim()));
      client.say(target, res);
    },
  },
  '!slots': { cd: true, cdTime: 300, run: slots },
  '!hangman': { cd: false, run: handleHangman, postRun: setHangmanCooldown },
  '!guess': { cd: false, run: handleHangman },
  '!metronome': { cd: true, cdTime: 300, run: metronome },
  '!randmon': { cd: true, cdTime: 300, run: randmon },
  '!roll': { cd: true, cdTime: 300, run: roll },
  '!sroll': { cd: true, cdTime: 300, run: sroll },
  '!randrunner': { cd: true, cdTime: 300, run: randrunner },
  '!commands': { cd: false, run: cmdList }
};

module.exports = cmds;
