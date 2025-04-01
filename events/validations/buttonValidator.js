const { devId } = require("../../config/config.json");
const getCommands = require("../../utils/getCommands");

module.exports = async (client, interaction) => {
    // Check if interaction is a button
    if (!interaction.isButton()) return;

    // Get buttons files
    const buttons = getCommands([], "buttons");
    const buttonObject = buttons.find((btn) => {
        const idPattern = new RegExp(`^${btn.customId}`);
        return idPattern.test(interaction.customId);
    });

    // Return if not exist
    if (!buttonObject) return;

    // Check if button is dev only
    if (buttonObject.devOnly && !devId.includes(interaction.member.id)) {
        const embed = await client.function.descEmbed(
            client,
            client.messages.general.devOnly,
            client.config.color.error
        );
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Check if command is local only
    if (
        buttonObject.testMode &&
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
    for (const permission of buttonObject.userPermissions || []) {
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
        for (const permission of buttonObject.botPermissions || []) {
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

    //Check if the button is yours
    if (interaction.message.interaction && buttonObject.selfInteract) {
        if (interaction.message.interaction.user.id !== interaction.user.id) {
            const embed = await client.function.descEmbed(
                client,
                client.messages.general.cannotUseInteraction,
                client.config.color.error
            );
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }

    // Execute the code
    try {
        await buttonObject.execute(client, interaction);
    } catch (err) {
        // Return error
        console.log(client.messages.general.errorValidatingButton);
        console.log(err);
    }
};
