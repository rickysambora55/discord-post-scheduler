const path = require("path");
const getFiles = require("./getFiles");

module.exports = (exceptions = [], dir = "commands") => {
    let localCommands = [];

    // Get all the commands from commands folder
    const commandCategories = getFiles(
        // eslint-disable-next-line no-undef
        path.join(__dirname, "..", dir),
        true
    );

    // Loop for each command folder
    for (const commandCategory of commandCategories) {
        // Get file
        const commandFiles = getFiles(commandCategory);

        // Loop for each command files
        for (const commandFile of commandFiles) {
            // Get parameters
            const commandObject = require(commandFile);

            // Skip command object
            if (exceptions.includes(commandObject.name)) continue;

            // Push into array
            localCommands.push(commandObject);
        }
    }

    return localCommands;
};
