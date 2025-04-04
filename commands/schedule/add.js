module.exports = {
    customId: "schedule.add",
    async execute(client, interaction) {
        try {
            // Deferred
            const message = await interaction.deferReply();

            // Get data
            const date = interaction.options.getString("date");
            const time = interaction.options.getString("time");
            const timezone = interaction.options.getInteger("timezone");
            const cycle = interaction.options.getInteger("cycle");
            const msg = interaction.options.getString("message");
            const channel = interaction.options.getChannel("channel").id;
            const img = interaction.options.getString("image");

            // Validate date
            const [validDate, day, month, year] =
                client.function.parseDateString(date);
            if (validDate) {
                return await message.edit({
                    content: "Invalid date format! Use DD/MM/YYYY",
                });
            }

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
            const invertedZone = zone !== 0 ? -zone : 0;

            // Create date
            const scheduledDate = new Date(
                Date.UTC(
                    year,
                    month - 1,
                    day,
                    hour + invertedZone,
                    minute,
                    second
                )
            );

            // Main function
            const scheduleData = {
                id_server: interaction.guild.id,
                id_channel: channel,
                time: scheduledDate,
                timezone: zone,
                cycle: cycle,
                message: msg,
                image: img || null,
            };

            await client.db.Schedule.create(scheduleData)
                .then(async (schedule) => {
                    interaction.editReply(
                        `Created schedule with ID: ${schedule.server_schedule_id}`
                    );

                    const sch = await client.db.Schedule.findAll({
                        where: {
                            id: schedule.id,
                        },
                        raw: true,
                    });

                    client.function.scheduleMessage(sch[0], client);
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
