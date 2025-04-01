require("dotenv").config();
const {
    Client,
    GatewayIntentBits,
    Partials,
    Collection,
} = require("discord.js");
const eventHandler = require("./handlers/eventHandler");
const db = require("./models");

let client;

async function startBot() {
    client = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
        partials: [Partials.User],
    });

    // Make collections
    client.package = require("./package.json");
    client.config = require("./config/config.json");
    client.messages = require("./config/messages.json");
    client.function = require("./functions/functions");

    client.events = new Collection();
    client.commands = new Collection();
    client.subCommands = new Collection();
    client.subCommandGroups = new Collection();

    // Execute event handlers
    eventHandler(client);

    // Login
    try {
        db.sequelize.sync().then(() => {
            client.db = db;
            console.log("🤖 Bot is online!");

            client.login(process.env.TOKEN);
        });
    } catch (error) {
        console.error("❌ Failed to login:", error);
    }

    return client;
}

// Auto-start if run directly
if (require.main === module) {
    startBot();
}

// Export both startBot and client (initially undefined)
module.exports = {
    startBot,
    get client() {
        return client;
    },
};
