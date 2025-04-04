module.exports = async (client, interaction) => {
    try {
        console.log(`Scheduler is running`);

        const schedules = await client.db.Schedule.findAll({
            raw: true,
        });

        if (schedules.length > 0) {
            schedules.map((sch) =>
                client.function.scheduleMessage(sch, client)
            );
        }

        // Main function
    } catch (error) {
        console.error(`[error] Unable to start scheduler`);
        console.error(error);
    }
};
