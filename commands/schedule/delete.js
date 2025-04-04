module.exports = {
    customId: "schedule.delete",
    async execute(client, interaction) {
        try {
            // Deferred
            await interaction.deferReply();

            // Get data
            const id = interaction.options.getInteger("id");

            // Main function
            try {
                const result = await client.db.Schedule.destroy({
                    where: {
                        server_schedule_id: id,
                        id_server: interaction.guild.id,
                    },
                });

                if (result > 0) {
                    interaction.editReply(
                        `✅ Schedule with id: ${id} has been deleted.`
                    );
                } else {
                    interaction.editReply(
                        `❌ No schedule found with id: ${id}.`
                    );
                }
            } catch (error) {
                console.error("❌ Error deleting schedule:", error);
            }
        } catch (error) {
            // Error function
            await client.function.errorCatch(client, interaction, error);
        }
    },
};
