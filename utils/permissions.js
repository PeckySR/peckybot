// permissions.js

// Check if user is a mod or broadcaster
const hasPerm = (ctx) => ctx.mod || ctx.badges?.broadcaster === '1';

module.exports = { hasPerm };
