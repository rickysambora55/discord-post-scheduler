module.exports = {
    customId: "schedule.list",
    async execute(client, interaction) {
        try {
            // Deferred
            await interaction.deferReply();

            // Main function
            const previewLength = 100;
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
                            const messagePreview = message.slice(
                                0,
                                previewLength
                            );
                            const cycleName = cycle ? `${cycle} days` : "Once";
                            const date = new Date(time);
                            const localTime = new Date(
                                date.getTime() + timezone * 60 * 60 * 1000
                            );
                            const dateString = localTime.toLocaleString(
                                "en-GB",
                                {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                    hour12: false,
                                    timeZone: "UTC",
                                }
                            );

                            const timezoneName =
                                timezone > 0
                                    ? `GMT+${timezone}`
                                    : `GMT${timezone}`;

                            return (
                                `**Schedule ID:** \`[${server_schedule_id}]\`\n` +
                                `**Channel:** <#${id_channel}>\n` +
                                `**Next run:** \`${dateString} ${timezoneName}\`\n` +
                                `**Cycle:** \`${cycleName}\`\n` +
                                `**Message:** \n\`\`\`md\n${messagePreview}${
                                    message.length > previewLength ? "..." : ""
                                }\`\`\``
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
