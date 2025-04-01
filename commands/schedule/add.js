module.exports = {
    customId: "schedule.add",
    async execute(client, interaction) {
        try {
            // Deferred
            const message = await interaction.deferReply();

            // Get data
            const time = interaction.options.getString("time");
            const timezone = interaction.options.getInteger("timezone");
            const cycle = interaction.options.getInteger("cycle");
            const msg = interaction.options.getString("message");
            const channel = interaction.options.getChannel("channel").id;
            const img = interaction.options.getString("image");

            // Validate time
            const [validTime, hour, minute, second] =
                client.function.parseTimeString(time);
            if (validTime) {
                return await message.edit({
                    content:
                        "Invalid time format! Use HH:MM or HH:MM:SS in 24 hours format",
                });
            }

            // Validate timezone
            const [validZone, zone] = client.function.parseTimezone(timezone);
            if (validZone) {
                return await message.edit({
                    content:
                        "Invalid timezone! Use a valid timezone from the list",
                });
            }

            // Main function
            const scheduleData = {
                id_server: interaction.guild.id,
                id_channel: channel,
                time: `${hour}:${minute}:${second}`,
                timezone: zone,
                cycle: cycle,
                message: msg,
                image: img || null,
            };

            client.db.Schedule.create(scheduleData)
                .then((schedule) => {
                    interaction.editReply(
                        `Created schedule with ID: ${schedule.id}`
                    );
                })
                .catch((error) => {
                    interaction.editReply(
                        "❌ Failed to create schedule. Contact administrator!"
                    );
                    console.error(error);
                });
        } catch (error) {
            // Error function
            await client.function.errorCatch(client, interaction, error);
        }
    },
};
