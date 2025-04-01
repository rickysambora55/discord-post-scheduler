const path = require("path");
const getFiles = require("../utils/getFiles");

module.exports = (client) => {
    // Return dir in events
    // eslint-disable-next-line no-undef
    const eventFolders = getFiles(path.join(__dirname, "..", "events"), true);

    // Loop for each foldername
    for (const eventFolder of eventFolders) {
        // Get files
        const eventFiles = getFiles(eventFolder);

        // Set folder name as event name
        let eventName;
        eventName = eventFolder.replace(/\\/g, "/").split("/").pop();

        // There is no validations event. It will be triggered on interactionCreate instead
        eventName === "validations"
            ? (eventName = "interactionCreate")
            : eventName;

        // Execute the event based on the eventName
        client.on(eventName, async (...arg) => {
            for (const eventFile of eventFiles) {
                const eventFunction = require(eventFile);
                await eventFunction(client, ...arg);
            }
        });
    }
};
