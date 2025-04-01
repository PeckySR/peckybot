// list.js

const { hasPerm } = require('../utils/permissions');
const { addCmd, editCmd, delCmd, getCmds } = require('./db');
const { changeTitle, changeGame } = require('./stream');
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
        client.say(
          target, 
          `@${ctx.username} → You do not have permission to add commands.`
        );
      }
    },
  },
  '!editcmd': {
    cd: false,
    run: (target, client, ctx, msg) => {
      if (hasPerm(ctx)) {
        editCmd(target, msg, ctx.username, (res) => client.say(target, res));
      } else {
        client.say(
          target, 
          `@${ctx.username} → You do not have permission to edit commands.`
        );
      }
    },
  },
  '!delcmd': {
    cd: false,
    run: (target, client, ctx, msg) => {
      if (hasPerm(ctx)) {
        delCmd(target, msg, ctx.username, (res) => client.say(target, res));
      } else {
        client.say(
          target, 
          `@${ctx.username} → You do not have permission to delete commands.`
        );
      }
    },
  },
  '!cmds': {
    cd: false,
    run: (target, client, ctx) => {
      getCmds(target, (err, names) => {
        const res = names.length 
          ? `@${ctx.username} → This channel's commands are: ${names.join(', ')}` 
          : `@${ctx.username} → There are no channel-specific commands.`;
        client.say(target, res);
      });
    },
  },
  '!changetitle': { 
    cd: false, 
    run: changeTitle 
  },
  '!changegame': { 
    cd: false, 
    run: changeGame 
  },
  '!getwr': {
    cd: false,
    run: async (target, client, ctx, msg) => {
      const args = msg.slice(6).trim().split(',');
      if (args.length < 2) {
        return client.say(
          target, 
          `@${ctx.username} → Use: !getwr <game>, <cat>, <var0>/<var1>`
        );
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
        return client.say(
          target, 
          `@${ctx.username} → Use: !getpb <game>, <cat>, <runner>`
        );
      }
      const res = await getPB(...args.map(arg => arg.trim()));
      client.say(target, res);
    },
  },
  '!slots': {
    cd: true,
    cdTime: 300,
    run: slots
  },
  '!hangman': {
    cd: false,
    run: handleHangman,
    postRun: setHangmanCooldown
  },
  '!guess': {
    cd: false,
    run: handleHangman
  },
  '!metronome': {
    cd: true,
    cdTime: 300,
    run: metronome
  },
  '!randmon': {
    cd: true,
    cdTime: 300,
    run: randmon
  },
  '!roll': {
    cd: true,
    cdTime: 300,
    run: roll
  },
  '!sroll': {
    cd: true,
    cdTime: 300,
    run: sroll
  },
  '!randrunner': {
    cd: true,
    cdTime: 300,
    run: randrunner
  },
  '!commands': {
    cd: false,
    run: cmdList
  }
};

module.exports = cmds;
