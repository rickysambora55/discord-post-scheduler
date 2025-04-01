const commandComparing = require("../../utils/commandComparing");
const getApplicationCommands = require("../../utils/getApplicationCommands");
const getCommands = require("../../utils/getCommands");
const { ApplicationCommandType } = require("discord.js");

module.exports = async (client) => {
    try {
        let commandList = [];
        const type = ApplicationCommandType.ChatInput;

        // Get all commands. Local (within code), application (deployed), private (deployed specific server)
        const [localCommands, applicationCommands, applicationPrivateCommands] =
            await Promise.all([
                getCommands([], "commands"),
                getApplicationCommands(client),
                getApplicationCommands(client, process.env.LOCALSERVER),
            ]);

        // // Set application commands to null
        // applicationCommands.set([]);
        // applicationPrivateCommands.set([]);

        // Loop for each local command
        for (const localCommand of localCommands) {
            // Extract commands parameters
            const { data, disabled, private, customId } = localCommand;

            // Push to commands collection
            if (customId) {
                client.commands.set(customId, localCommand);
                continue;
            }

            const commandName = data.toJSON().name;
            const commandDescription = data.toJSON()?.description;
            const commandOptions = data.toJSON()?.options;
            const commandNSFW = data.toJSON()?.nsfw;
            const commandContext = data.toJSON()?.contexts;
            const commandIntegration = data.toJSON()?.integration_types;
            commandList.push(commandName);

            // Find if local command is deployed
            const existingCommand = await applicationCommands.cache.find(
                (cmd) => cmd.name === commandName && cmd.type === type
            );
            const existingPrivateCommand =
                await applicationPrivateCommands.cache.find(
                    (cmd) => cmd.name === commandName && cmd.type === type
                );

            if (disabled) {
                // If the command is marked as disabled then don't push it to the cache
                if (existingCommand) {
                    // Delete if it registered
                    await applicationCommands.delete(existingCommand.id);

                    console.log(
                        client.messages.general.commandDisabled.replace(
                            "{0}",
                            commandName
                        )
                    );
                } else if (existingPrivateCommand) {
                    await applicationPrivateCommands.delete(
                        existingPrivateCommand.id
                    );

                    console.log(
                        client.messages.general.commandDisabled.replace(
                            "{0}",
                            commandName
                        )
                    );
                } else {
                    // Command not registered, so ignore it
                    console.log(
                        client.messages.general.commandSkipped.replace(
                            "{0}",
                            commandName
                        )
                    );
                }
            } else if (private) {
                // Push command into collection
                client.commands.set(localCommand.data.name, localCommand);

                // Private command
                // Check if command is already registerd in private server
                if (existingPrivateCommand) {
                    // Compare if the command has any updates. If not then simply ignore
                    if (
                        commandComparing(existingPrivateCommand, localCommand)
                    ) {
                        // Push the command update to the cache
                        await applicationPrivateCommands.edit(
                            existingPrivateCommand.id,
                            {
                                name: commandName,
                                description: commandDescription,
                                options: commandOptions,
                                nsfw: commandNSFW,
                                contexts: commandContext,
                                integrationTypes: commandIntegration,
                            }
                        );

                        console.log(
                            client.messages.general.commandEdited.replace(
                                "{0}",
                                commandName
                            ) + " [private]"
                        );
                    }
                } else {
                    // Command is not registered as server command (private)
                    // Check if command is already registered globally then delete
                    if (existingCommand)
                        await applicationCommands.delete(existingCommand.id);

                    // Command did not exist, so register it
                    await applicationPrivateCommands.create({
                        name: commandName,
                        description: commandDescription,
                        options: commandOptions,
                        nsfw: commandNSFW,
                        contexts: commandContext,
                        integrationTypes: commandIntegration,
                    });

                    console.log(
                        client.messages.general.commandRegistered.replace(
                            "{0}",
                            commandName
                        ) + " [private]"
                    );
                }
            } else {
                // Push command into collection
                client.commands.set(localCommand.data.name, localCommand);

                // Global command
                // Check if command is already registered globally
                if (existingCommand) {
                    // Command already registered, check if there any updates
                    if (commandComparing(existingCommand, localCommand)) {
                        // Update existing command
                        await applicationCommands.edit(existingCommand.id, {
                            name: commandName,
                            description: commandDescription,
                            options: commandOptions,
                            nsfw: commandNSFW,
                            contexts: commandContext,
                            integrationTypes: commandIntegration,
                        });

                        console.log(
                            client.messages.general.commandEdited.replace(
                                "{0}",
                                commandName
                            ) + " [global]"
                        );
                    }
                } else {
                    // Check if command is already registered in private server then delete
                    if (existingPrivateCommand)
                        await applicationPrivateCommands.delete(
                            existingPrivateCommand.id
                        );

                    // Command did not exist, so register it
                    await applicationCommands.create({
                        name: commandName,
                        description: commandDescription,
                        options: commandOptions,
                        nsfw: commandNSFW,
                        contexts: commandContext,
                        integrationTypes: commandIntegration,
                    });

                    console.log(
                        client.messages.general.commandRegistered.replace(
                            "{0}",
                            commandName
                        ) + " [global]"
                    );
                }
            }
        }

        // Loop for each registered command to find file deleted registered commands
        const illegalGlobal = Array.from(
            applicationCommands.cache.filter(
                (command) =>
                    !commandList.includes(command.name) && command.type === type
            )
        );
        const illegalPrivate = Array.from(
            applicationPrivateCommands.cache.filter(
                (command) =>
                    !commandList.includes(command.name) && command.type === type
            )
        );

        // Extract each illegal command and delete it from register
        if (illegalGlobal.length > 0) {
            illegalGlobal.forEach(async (element) => {
                await applicationCommands.delete(element[0]);

                console.log(
                    client.messages.general.commandDeleted.replace(
                        "{0}",
                        element[1].name
                    )
                );
            });
        }
        if (illegalPrivate.length > 0) {
            illegalPrivate.forEach(async (element) => {
                await applicationPrivateCommands.delete(element[0]);

                console.log(
                    client.messages.general.commandDeleted.replace(
                        "{0}",
                        element[1].name
                    )
                );
            });
        }
    } catch (err) {
        // Return error
        console.error(client.messages.general.errorRegisterCommand);
        console.error(err);
    }
};
