module.exports = {
    customId: "schedule.list",
    async execute(client, interaction) {
        try {
            // Deferred
            await interaction.deferReply();

            // Main function
            const schedules = await client.db.Schedule.findAll({
                where: {
                    id_server: interaction.guild.id,
                },
                raw: true,
            });

            if (schedules.length > 0) {
                const output = schedules
                    .map(
                        ({
                            server_schedule_id,
                            id_channel,
                            time,
                            timezone,
                            cycle,
                            message,
                        }) => {
                            const messagePreview = message.slice(0, 30);
                            const cycleName = cycle ? `${cycle} days` : "Once";
                            const timezoneName =
                                timezone > 0
                                    ? `GMT+${timezone}`
                                    : `GMT${timezone}`;

                            return (
                                `**Schedule ID:** [${server_schedule_id}]\n` +
                                `**Channel:** <#${id_channel}>\n` +
                                `**Next run:** ${time} ${timezoneName}\n` +
                                `**Cycle:** ${cycleName}\n` +
                                `**Message:** ${messagePreview}...`
                            );
                        }
                    )
                    .join("\n\n");

                interaction.editReply(output);
            } else {
                interaction.editReply(`❌ No schedule found.`);
            }
        } catch (error) {
            // Error function
            await client.function.errorCatch(client, interaction, error);
        }
    },
};
