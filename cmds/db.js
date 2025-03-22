// db.js

const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const { sanitizeInput } = require('../utils/sanitizer');

// SQLite Database Connection
const db = new sqlite3.Database('./data/database.db', (err) => {
  if (err) console.error('DB Connection Error:', err.message);
  else console.log('Connected to SQLite DB');
});

// Graceful Shutdown Handler
async function handleExit() {
  return new Promise((resolve) => {
    db.close((err) => {
      if (err) console.error('DB Close Error:', err.message);
      else console.log('SQLite DB Disconnected');
      resolve();
    });
  });
}
process.on('SIGTERM', async () => {
  await handleExit();
  process.exit(0);
});

// Command Database Functions
function addCmd(target, msg, username, cb) {
  const match = /^!addcmd\s+(\S+)\s+(.+)/i.exec(msg);
  if (!match) return cb?.('Use: !addcmd <cmd> <response>');

  const [, rawCmd, rawRes] = match;
  const cmd = sanitizeInput(rawCmd);
  const res = sanitizeInput(rawRes);
  const ch = target?.replace(/^#/, '');

  if (!ch) return cb?.("Error: couldn't determine channel.");
  if (!cmd || !res) return cb?.("Error: invalid command format.");

  db.get('SELECT * FROM commands WHERE commandname = ? AND channel = ?', [cmd, ch], (err, row) => {
    if (err) return cb?.(`DB Error: ${err.message}`);
    if (row) return cb?.(`Cmd '${cmd}' already exists.`);
    db.run(
      'INSERT INTO commands (commandname, response, channel) VALUES (?, ?, ?)',
      [cmd, res, ch],
      (err) => {
        if (err) return cb?.(`DB Error: ${err.message}`);
        cb?.(`Cmd added: ${cmd}`);
      }
    );
  });
}

function editCmd(target, msg, username, cb) {
  const match = /^!editcmd\s+(\S+)\s+(.+)/i.exec(msg);
  if (!match) return cb?.('Use: !editcmd <cmd> <newResponse>');

  const [, rawCmd, rawRes] = match;
  const cmd = sanitizeInput(rawCmd);
  const res = sanitizeInput(rawRes);
  const ch = target?.replace(/^#/, '');

  if (!ch) return cb?.("Error: couldn't determine channel.");

  db.run(
    'UPDATE commands SET response = ? WHERE commandname = ? AND channel = ?',
    [res, cmd, ch],
    (err) => {
      if (err) return cb?.(`DB Error: ${err.message}`);
      cb?.(`Cmd edited: ${cmd}`);
    }
  );
}

function delCmd(target, msg, username, cb) {
  const match = /^!delcmd\s+(\S+)$/i.exec(msg);
  if (!match) return cb?.('Use: !delcmd <cmd>');

  const cmd = sanitizeInput(match[1]);
  const ch = target?.replace(/^#/, '');

  if (!ch) return cb?.("Error: couldn't determine channel.");

  db.run('DELETE FROM commands WHERE commandname = ? AND channel = ?', [cmd, ch], (err) => {
    if (err) return cb?.(`DB Error: ${err.message}`);
    cb?.(`Cmd deleted: ${cmd}`);
  });
}

function getCmds(target, cb) {
  const ch = target?.replace(/^#/, '');
  if (!ch) return cb?.("Error: couldn't determine channel.");

  db.all('SELECT commandname FROM commands WHERE channel = ?', [ch], (err, rows) => {
    if (err) return cb?.(`DB Error: ${err.message}`);
    cb?.(null, rows.map((row) => row.commandname));
  });
}

function getCmdFromDB(target, cmd) {
  return new Promise((resolve, reject) => {
    const ch = target?.replace(/^#/, '');
    const cleanCmd = sanitizeInput(cmd);

    if (!ch || !cleanCmd) return resolve(null);

    db.get(
      'SELECT * FROM commands WHERE channel = ? AND commandname = ?',
      [ch, cleanCmd],
      (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      }
    );
  });
}

const defaultCd = 10;

module.exports = {
  addCmd,
  editCmd,
  delCmd,
  getCmds,
  getCmdFromDB,
  defaultCd,
};
