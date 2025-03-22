// streamUpdater.js

const axios = require('axios');

const twitchApi = axios.create({
  baseURL: 'https://api.twitch.tv/helix',
  headers: {
    'Client-ID': process.env.CLIENT_ID,
    'Authorization': `Bearer ${process.env.OAUTH_TOKEN1}`,
  },
});

async function setTitle(broadcasterId, title) {
  const res = await twitchApi.patch(`/channels?broadcaster_id=${broadcasterId}`, {
    title,
  });
  return res.data;
}

async function setGame(broadcasterId, gameId) {
  const res = await twitchApi.patch(`/channels?broadcaster_id=${broadcasterId}`, {
    game_id: gameId,
  });
  return res.data;
}

async function getGameId(gameName) {
  try {
    const res = await twitchApi.get('/games', { params: { name: gameName } });
    if (res.data.data.length > 0) return res.data.data[0].id;
    throw new Error(`Game not found: ${gameName}`);
  } catch (err) {
    console.error('Game ID error:', err);
    throw err;
  }
}

module.exports = { setTitle, setGame, getGameId };
