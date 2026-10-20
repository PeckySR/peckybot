// permissions.js

// Badge tags arrive as "moderator/1,subscriber/12". tmi.js turns a tag with an
// empty value into true rather than a string, so anything but a string means no
// badges at all.
const parseBadges = (raw) => {
  if (typeof raw !== 'string') return {};
  return Object.fromEntries(raw.split(',').map((badge) => badge.split('/')));
};

// Check if user is a mod or broadcaster
const hasPerm = (ctx) => {
  // In a Shared Chat session the mod tag and badges describe whichever channel
  // this copy of the message landed in, which is not always the one it was sent
  // from. Twitch carries the sender's own badges over in source-badges, so read
  // those instead and keep permissions tied to the channel being acted on.
  if (ctx['source-room-id']) {
    const badges = parseBadges(ctx['source-badges']);
    return badges.moderator === '1' || badges.broadcaster === '1';
  }
  return ctx.mod || ctx.badges?.broadcaster === '1';
};

module.exports = { hasPerm };
