module.exports = async (client, guildId) => {
    let applicationCommands;

    if (guildId) {
        // Server private commands
        const guild = await client.guilds.fetch(guildId);
        applicationCommands = guild.commands;
    } else {
        // Global commands
        applicationCommands = client.application.commands;
    }

    // Fetch commands cache
    await applicationCommands.fetch();
    return applicationCommands;
};
