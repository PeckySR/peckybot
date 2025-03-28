// commands.js

// Function called when the "!commands" command is issued
function cmdList(target, client, ctx) {
    client.say(
        target, 
        `@${ctx.username} → Use !cmds to access channel-specific commands. 
                            Global commands are available here: 
                            https://github.com/PeckySR/peckybot`);
}

module.exports = { cmdList };
