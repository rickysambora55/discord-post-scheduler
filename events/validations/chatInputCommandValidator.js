const { devId } = require("../../config/config.json");
const getCommands = require("../../utils/getCommands");

module.exports = async (client, interaction) => {
    // Check if the interaction is command
    if (!interaction.isChatInputCommand()) return;

    // Get commands from file and find corresponding command
    const localCommands = getCommands([], "commands");
    const commandObject = localCommands.find(
        (cmd) => cmd.data?.name === interaction.commandName
    );

    // Return if not exist
    if (!commandObject) return;

    // Get the command subcommand and subcommandgroup name
    const subCommand = interaction.options.getSubcommand(false);
    const subCommandGroup = interaction.options.getSubcommandGroup(false);

    // Check if command is dev only
    if (commandObject.devOnly && !devId.includes(interaction.member.id)) {
        const embed = await client.function.descEmbed(
            client,
            client.messages.general.devOnly,
            client.config.color.error
        );
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Check if command is local only
    if (
        commandObject.testMode &&
        interaction?.guild?.id !== process.env.LOCALSERVER
    ) {
        const embed = await client.function.descEmbed(
            client,
            client.messages.general.testMode,
            client.config.color.error
        );
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Check if user has permissions
    for (const permission of commandObject.userPermissions || []) {
        if (!interaction.member.permissions.has(permission)) {
            const embed = await client.function.descEmbed(
                client,
                client.messages.general.userNoPermissions,
                client.config.color.error
            );
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }

    // Check if bot has permissions
    if (interaction.guild) {
        const bot = interaction.guild.members.me;
        for (const permission of commandObject.botPermissions || []) {
            if (!bot.permissions.has(permission)) {
                const embed = await client.function.descEmbed(
                    client,
                    client.messages.general.botNoPermissions,
                    client.config.color.error
                );
                return interaction.reply({ embeds: [embed], ephemeral: false });
            }
        }
    }

    // Return if bot has no access to channel/thread
    // const access = await interaction.channel.members.has(client.user.id);
    // if (!access) {
    //     const embed = await client.function.descEmbed(
    //         client,
    //         client.messages.general.botNoAccess,
    //         client.config.color.error
    //     );
    //     return interaction.reply({ embeds: [embed], ephemeral: false });
    // }

    try {
        // Check if it has subcommand
        if (subCommand) {
            // If its sub command group then execute subcommand group file else subcommand file
            if (subCommandGroup) {
                client.commands
                    .get(
                        `${interaction.commandName}.${subCommandGroup}.${subCommand}`
                    )
                    .execute(client, interaction);
            } else {
                client.commands
                    .get(`${interaction.commandName}.${subCommand}`)
                    .execute(client, interaction);
            }
        } else {
            await commandObject.execute(client, interaction);
        }
    } catch (err) {
        // Return error
        console.log(client.messages.general.errorValidatingCommand);
        console.log(err);
    }
};
