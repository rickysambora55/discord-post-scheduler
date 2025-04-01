module.exports = (sequelize, DataTypes) => {
    const Schedule = sequelize.define(
        "Schedule",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            id_server: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            id_channel: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            time: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            timezone: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            cycle: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            message: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            image: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            server_schedule_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                unique: "server_schedule_unique",
            },
        },
        {
            timestamps: true,
            indexes: [
                {
                    unique: true,
                    fields: ["id_server", "server_schedule_id"],
                },
            ],
        }
    );

    // Automatically increment schedule_id per server
    Schedule.beforeCreate(async (schedule, _options) => {
        try {
            const maxScheduleId = await Schedule.max("server_schedule_id", {
                where: {
                    id_server: schedule.id_server,
                },
            });

            schedule.server_schedule_id = maxScheduleId ? maxScheduleId + 1 : 1;
        } catch (error) {
            console.error("❌ Error in beforeCreate hook:", error);
        }
    });

    return Schedule;
};
