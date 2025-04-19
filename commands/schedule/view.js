module.exports = {
    customId: "schedule.view",
    async execute(client, interaction) {
        try {
            // Deferred
            await interaction.deferReply();

            // Get data
            const id = interaction.options.getInteger("id");

            // Main function
            const schedule = await client.db.Schedule.findOne({
                where: {
                    server_schedule_id: id,
                    id_server: interaction.guild.id,
                },
                raw: true,
            });

            if (!schedule) {
                await interaction.editReply({
                    content: `❌ No schedule found with id: ${id}`,
                });
                return;
            }

            const { message, time, timezone, image } = schedule;

            // Time format
            const date = new Date(time);
            const localTime = new Date(
                date.getTime() + timezone * 60 * 60 * 1000
            );
            const today = localTime.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "UTC",
            });
            const tomorrowDate = localTime;
            tomorrowDate.setDate(date.getDate() + 1);
            const tomorrow = tomorrowDate.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "UTC",
            });
            const formattedMessage = message
                .replace(/\\n/g, "\n")
                .replace(/<DATE>/g, today)
                .replace(/<TOMORROW>/g, tomorrow);

            await interaction.editReply({
                content: formattedMessage,
                files: image ? [image] : [],
            });
        } catch (error) {
            // Error function
            await client.function.errorCatch(client, interaction, error);
        }
    },
};
