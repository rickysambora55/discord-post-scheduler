const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    botPermissions: [
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.SendMessagesInThreads,
        PermissionFlagsBits.UseExternalEmojis,
        PermissionFlagsBits.ViewChannel,
    ],
    data: new SlashCommandBuilder()
        .setName("schedule")
        .setDescription("Manages the schedules")
        .setIntegrationTypes(0)
        .setContexts(0)
        .addSubcommand((options) =>
            options
                .setName("add")
                .setDescription("Add a schedule")
                .addStringOption((option) =>
                    option
                        .setName("date")
                        .setDescription(
                            "Date to schedule DD/MM/YYYY up to 1 week. e.g. 15/12/2025"
                        )
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("time")
                        .setDescription(
                            "When to schedule. e.g. 12:05 in 24 hours format"
                        )
                        .setRequired(true)
                )
                .addIntegerOption((option) =>
                    option
                        .setName("timezone")
                        .setDescription("Timezone to schedule")
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addIntegerOption((option) =>
                    option
                        .setName("cycle")
                        .setDescription("Cycle to schedule")
                        .setRequired(true)
                        .addChoices(
                            { name: "Once", value: 0 },
                            { name: "Daily", value: 1 },
                            { name: "Weekly", value: 7 },
                            { name: "Biweekly (14d)", value: 14 },
                            { name: "3 Weeks (21d)", value: 21 },
                            { name: "Monthly (30d)", value: 30 }
                        )
                )
                .addStringOption((option) =>
                    option
                        .setName("message")
                        .setDescription(
                            "Message to send when the schedule triggers"
                        )
                        .setRequired(true)
                )
                .addChannelOption((option) =>
                    option
                        .setName("channel")
                        .setDescription("Specifies the channel to send")
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("image")
                        .setDescription("Image URL to send with the schedule")
                        .setRequired(false)
                )
        )
        .addSubcommand((options) =>
            options
                .setName("delete")
                .setDescription("Delete the schedule")
                .addIntegerOption((option) =>
                    option
                        .setName("id")
                        .setDescription("Schedule id from /schedule list")
                        .setMinValue(0)
                        .setRequired(true)
                )
        )
        .addSubcommand((options) =>
            options.setName("list").setDescription("List all schedules")
        ),

    async autocomplete(_client, interaction) {
        // Get the interaction
        const focusedOption = interaction.options.getFocused(true);
        const value = interaction.options.getFocused().toLowerCase();

        // Stop if the interaction is not correct
        if (!focusedOption.name === "timezone") return;

        // Push choices to into choices array
        let choices = [...Array(29)].map((_, i) => ({
            name: `GMT${i - 14 >= 0 ? "+" : ""}${i - 14}`,
            value: i - 14,
        }));

        // Slice only 24 choices to show based on type options
        const filtered = choices
            .filter((choice) => choice.name.toLowerCase().includes(value))
            .slice(0, 24);

        // Respond the interaction if existing
        if (!interaction) return;
        await interaction.respond(filtered);
    },
};
