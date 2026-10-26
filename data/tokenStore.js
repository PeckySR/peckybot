// tokenStore.js
//
// Keeps the bot's Twitch access token current. Access tokens last ~4 hours;
// the refresh token they come with does not expire, so it gets traded for a
// new access token whenever the old one is close to running out.
//
// One-time setup lives in TOKEN_SETUP.txt next to this file.

const axios = require('axios');
const { db } = require('../cmds/db');

const TOKEN_URL = 'https://id.twitch.tv/oauth2/token';

// Renew a minute early so a token cannot lapse in the gap between this check
// and the connection attempt that ends up using the result.
const EXPIRY_MARGIN_MS = 60 * 1000;

// tmi.js can ask for a token from more than one reconnect at a time. Sharing
// one in-flight promise stops concurrent callers burning two refreshes.
let inFlight = null;

const get = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row))));

const run = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.run(sql, params, (err) => (err ? reject(err) : resolve())));

async function readRow() {
  await run(`
    CREATE TABLE IF NOT EXISTS oauth_tokens (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      access_token TEXT,
      refresh_token TEXT NOT NULL,
      seeded_from TEXT,
      expires_at INTEGER NOT NULL
    )
  `);

  const row = await get('SELECT * FROM oauth_tokens WHERE id = 1');
  const envToken = process.env.REFRESH_TOKEN;

  if (!row) {
    if (!envToken) {
      throw new Error('No stored refresh token and REFRESH_TOKEN is unset. See TOKEN_SETUP.txt.');
    }
    await run(
      'INSERT INTO oauth_tokens (id, access_token, refresh_token, seeded_from, expires_at) VALUES (1, NULL, ?, ?, 0)',
      [envToken, envToken]
    );
    return { access_token: null, refresh_token: envToken, expires_at: 0 };
  }

  // Twitch hands back a rotated refresh token on most renewals, so the stored
  // one is normally newer than the environment and must win. Compare against
  // the value we were originally seeded with instead: if that has changed, the
  // env var was deliberately replaced and should take over.
  if (envToken && envToken !== row.seeded_from) {
    console.log('🔑 REFRESH_TOKEN changed, re-seeding from environment');
    await run(
      'UPDATE oauth_tokens SET access_token = NULL, refresh_token = ?, seeded_from = ?, expires_at = 0 WHERE id = 1',
      [envToken, envToken]
    );
    return { access_token: null, refresh_token: envToken, expires_at: 0 };
  }

  return row;
}

async function refresh(refreshToken) {
  const body = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  let data;
  try {
    ({ data } = await axios.post(TOKEN_URL, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }));
  } catch (err) {
    const detail = err.response?.data?.message || err.message;
    // A refresh token only dies if the password changed, the app was
    // disconnected, or the secret was rotated. All three need a human.
    throw new Error(`Token refresh failed (${detail}). Re-run the one-time setup to get a new REFRESH_TOKEN.`);
  }

  const expiresAt = Date.now() + data.expires_in * 1000;
  await run(
    'UPDATE oauth_tokens SET access_token = ?, refresh_token = ?, expires_at = ? WHERE id = 1',
    [data.access_token, data.refresh_token || refreshToken, expiresAt]
  );

  console.log(`🔄 Twitch token refreshed, valid for ${Math.round(data.expires_in / 60)} min`);
  return data.access_token;
}

async function resolveToken() {
  const row = await readRow();
  if (row.access_token && row.expires_at > Date.now() + EXPIRY_MARGIN_MS) {
    return row.access_token;
  }
  return refresh(row.refresh_token);
}

// Returns a currently-valid access token, renewing it first if necessary.
// Deliberately not async: `inFlight` has to be assigned in the same tick as the
// check above it, or concurrent callers all sail past a still-null guard while
// the first one is awaiting, and each fires its own redundant refresh.
function getFreshToken() {
  if (inFlight) return inFlight;
  inFlight = resolveToken().finally(() => { inFlight = null; });
  return inFlight;
}

module.exports = { getFreshToken };
