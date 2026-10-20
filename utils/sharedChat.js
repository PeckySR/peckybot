// sharedChat.js

// During a Shared Chat session Twitch copies every message into each channel in
// the session, so the bot receives one copy per channel it has joined. Every
// copy carries the same source-id, which is what lets us act on a message once
// rather than once per channel.
//
// Commands stay tied to the channel a message was actually sent from, so each
// channel keeps its own cooldowns. Commands marked shared in list.js instead run
// against one channel standing in for the whole session, so everyone taking part
// is playing the same game.

const SEEN_TTL = 60 * 1000; // Long enough for every copy of a message to land
const SESSION_TTL = 5 * 60 * 1000; // Cleared shortly after a session ends

const seen = new Map(); // source-id -> { room, ts }
const sessions = new Map(); // channel -> { room, ts }
const channels = new Map(); // room-id -> channel

const sweep = (now) => {
  for (const [id, entry] of seen) {
    if (now - entry.ts > SEEN_TTL) seen.delete(id);
  }
  for (const [channel, entry] of sessions) {
    if (now - entry.ts > SESSION_TTL) sessions.delete(channel);
  }
};

// Remember which channel a room id belongs to. Called on join so the bot can
// name the channel a Shared Chat message came from before anyone has spoken.
const noteRoom = (channel, roomId) => {
  if (roomId) channels.set(roomId, channel);
};

// Work out which channels a message belongs to, or null when another copy of it
// has already been handled.
//   origin  - the channel it was sent from, or null if the bot is not in it
//   session - one channel standing in for the whole Shared Chat session
const resolveRooms = (channel, ctx) => {
  noteRoom(channel, ctx['room-id']);

  const sourceId = ctx['source-id'];
  if (!sourceId) return { origin: channel, session: channel };

  const now = Date.now();
  sweep(now);

  const handled = seen.get(sourceId);
  if (handled) {
    // Another copy already ran. Pin this channel to the same session so later
    // messages arriving here reach the same game.
    sessions.set(channel, { room: handled.room, ts: now });
    return null;
  }

  // First copy wins and fixes the session's channel until the session ends.
  const session = sessions.get(channel)?.room ?? channel;
  seen.set(sourceId, { room: session, ts: now });
  sessions.set(channel, { room: session, ts: now });

  return { origin: channels.get(ctx['source-room-id']) ?? null, session };
};

module.exports = { noteRoom, resolveRooms };
