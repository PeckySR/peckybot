// src.js

const axios = require('axios');

function capitalizeWords(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` : `${m}:${s.toString().padStart(2, '0')}`;
}

function combinationMatches(combo, filters) {
  const labelSet = new Set(combo.map(c => c.label.toLowerCase()));
  return filters.every(f => labelSet.has(f));
}

async function getWR(gameName, categoryName, variableString = '') {
  const variableValues = variableString.toLowerCase().split(/[,/]/).map(v => v.trim()).filter(Boolean);
    console.log(gameName);
  try {
    const gameRes = await axios.get(`https://www.speedrun.com/api/v1/games?name=${encodeURIComponent(gameName)}`);
    const game = gameRes.data.data[0];
    if (!game) throw new Error('Game not found');

    const gameId = game.id;
    const gameDisplay = game.names.international;

    const catRes = await axios.get(`https://www.speedrun.com/api/v1/games/${gameId}/categories`);
    const category = catRes.data.data.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
    if (!category) throw new Error('Category not found');

    const categoryId = category.id;
    const varRes = await axios.get(`https://www.speedrun.com/api/v1/categories/${categoryId}/variables`);
    const subVars = varRes.data.data.filter(v => v['is-subcategory']);

    let combinations = [[]];
    for (const variable of subVars) {
      let newCombos = [];
      for (const valId in variable.values.values) {
        const label = variable.values.values[valId].label;
        combinations.forEach(c => newCombos.push([...c, { variableId: variable.id, subcategoryId: valId, label }]));
      }
      combinations = newCombos;
    }

    const combinationsToUse = variableValues.length > 0
      ? combinations.filter(combo => combinationMatches(combo, variableValues))
      : combinations;

    const results = [];
    for (const combo of combinationsToUse) {
      const params = combo.map(v => `var-${v.variableId}=${v.subcategoryId}`).join('&');
      try {
        const lbRes = await axios.get(`https://www.speedrun.com/api/v1/leaderboards/${gameId}/category/${categoryId}?top=1&${params}`);
        const wrRun = lbRes.data.data.runs[0];

        if (wrRun) {
          const time = formatTime(parseInt(wrRun.run.times.primary_t));
          let runner = "Unknown";
          let video = wrRun.run.videos?.links?.[0]?.uri || "No video link";

          if (wrRun.run.players[0]?.id) {
            const rRes = await axios.get(`https://www.speedrun.com/api/v1/users/${wrRun.run.players[0].id}`);
            runner = rRes.data.data.names.international;
          }

          const label = combo.map(c => c.label).join(' - ') || 'Default';
          results.push(`${label}: ${time} by ${runner} | ${video}`);
        }
      } catch (e) { continue; }
    }

    if (results.length > 0) {
      return `WR for ${gameDisplay} - ${capitalizeWords(categoryName)}: ${results.join(' | ')}`;
    } else {
      return `No WR found for ${gameDisplay} - ${capitalizeWords(categoryName)}.`;
    }
  } catch (err) {
    if (err.message.includes('Game not found')) return 'Game not found.';
    if (err.message.includes('Category not found')) return 'Category not found.';
    return 'Error fetching WR. Check game/category names.';
  }
}

async function getPB(gameName, categoryName, runnerName, variableString = '') {
  const variableValues = variableString.toLowerCase().split(/[,/]/).map(v => v.trim()).filter(Boolean);

  try {
    const gameRes = await axios.get(`https://www.speedrun.com/api/v1/games?name=${encodeURIComponent(gameName)}`);
    const game = gameRes.data.data[0];
    if (!game) throw new Error('Game not found');

    const gameId = game.id;
    const gameDisplay = game.names.international;

    const catRes = await axios.get(`https://www.speedrun.com/api/v1/games/${gameId}/categories`);
    const category = catRes.data.data.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
    if (!category) throw new Error('Category not found');

    const categoryId = category.id;

    const runnerRes = await axios.get(`https://www.speedrun.com/api/v1/users?lookup=${encodeURIComponent(runnerName)}`);
    const runnerData = runnerRes.data.data[0];
    if (!runnerData) throw new Error('Runner not found');

    const runnerId = runnerData.id;
    const runnerDisplay = runnerData.names.international;

    const varRes = await axios.get(`https://www.speedrun.com/api/v1/categories/${categoryId}/variables`);
    const subVars = varRes.data.data.filter(v => v['is-subcategory']);

    let combinations = [[]];
    for (const variable of subVars) {
      let newCombos = [];
      for (const valId in variable.values.values) {
        const label = variable.values.values[valId].label;
        combinations.forEach(c => newCombos.push([...c, { variableId: variable.id, subcategoryId: valId, label }]));
      }
      combinations = newCombos;
    }

    const combinationsToUse = variableValues.length > 0
      ? combinations.filter(combo => combinationMatches(combo, variableValues))
      : combinations;

    let results = [];
    for (const combo of combinationsToUse) {
      const params = combo.map(v => `var-${v.variableId}=${v.subcategoryId}`).join('&');
      try {
        const lbRes = await axios.get(`https://www.speedrun.com/api/v1/leaderboards/${gameId}/category/${categoryId}?top=100&${params}`);
        const runs = lbRes.data.data.runs.filter(r => r.run.players[0]?.id === runnerId);
        for (const r of runs) {
          const time = formatTime(parseInt(r.run.times.primary_t));
          const label = combo.map(c => c.label).join(' - ') || 'Default';
          const video = r.run.videos?.links?.[0]?.uri || "No video link";
          results.push(`${label}: ${time} | ${video}`);
        }
      } catch (e) { continue; }
    }

    if (results.length > 0) {
      return `${runnerDisplay}'s PB for ${gameDisplay} - ${capitalizeWords(categoryName)}: ${results.join(' | ')}`;
    } else {
      return `No PB found for ${runnerDisplay} in ${gameDisplay} - ${capitalizeWords(categoryName)}.`;
    }
  } catch (err) {
    if (err.message.includes('Game not found')) return 'Game not found.';
    if (err.message.includes('Category not found')) return 'Category not found.';
    if (err.message.includes('Runner not found')) return 'Runner not found.';
    return 'Error fetching PB. Check names.';
  }
}

module.exports = { getWR, getPB };
