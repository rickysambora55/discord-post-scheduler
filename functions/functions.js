const { EmbedBuilder } = require("discord.js");
const axios = require("axios");
const net = require("net");

// Embed template with description only
function descEmbed(client, desc, color = client.config.color.bot) {
    const embed = new EmbedBuilder()
        .setColor(parseInt(color))
        .setDescription(`${desc}`);
    return embed;
}

// Get api
async function getData(endpoint, options = {}) {
    try {
        const response = await axios.get(endpoint, {
            ...options,
        });

        return response;
    } catch (err) {
        console.error(`Error fetching in ${endpoint}: ${err.message}`);
        return null;
    }
}

// Post api
async function postData(endpoint, values, options = {}) {
    try {
        const response = await axios.post(endpoint, values, {
            headers: {
                "Content-Type": "application/json",
            },
            ...options,
        });

        return response;
    } catch (err) {
        console.error(`Error post in ${endpoint}: ${err.message}`);
        return err.response;
    }
}

// Remove duplicates object
function removeDuplicates(arr, prop) {
    // Use a Set to keep track of unique property values
    const seen = new Set();
    // Filter the array to keep only the first occurrence of each property value
    return arr.filter((obj) => {
        // Check if the property value is already in the Set
        if (seen.has(obj[prop])) {
            // If it is, return false to filter out this object
            return false;
        }
        // If not, add the property value to the Set and return true to keep this object
        seen.add(obj[prop]);
        return true;
    });
}

// Validate ip address
function isValidIpAddress(ipAddress) {
    // For IPv4
    if (net.isIPv4(ipAddress)) {
        return true;
    }

    // // For IPv6
    // if (net.isIPv6(ipAddress)) {
    //     return true;
    // }

    return false;
}

// Parse timestring
function parseTimeString(timeStr) {
    timeStr = timeStr.replace(/:/g, ".");

    const timeParts = timeStr.split(".");
    if (
        timeParts.length > 3 ||
        timeParts.length < 1 ||
        !timeParts.every((part) => /^\d+$/.test(part))
    ) {
        return [true, 0, 0, 0];
    }

    const hour = parseInt(timeParts[0], 10);
    const minute = timeParts.length > 1 ? parseInt(timeParts[1], 10) : 0;
    const second = timeParts.length > 2 ? parseInt(timeParts[2], 10) : 0;

    // Validate ranges
    if (
        isNaN(hour) ||
        hour < 0 ||
        hour > 23 ||
        isNaN(minute) ||
        minute < 0 ||
        minute > 59 ||
        isNaN(second) ||
        second < 0 ||
        second > 59
    ) {
        return [true, 0, 0, 0];
    }

    return [false, hour, minute, second];
}

// Parse datestring
function parseDateString(dateStr) {
    dateStr = dateStr.replace(/-/g, "/");
    const dateParts = dateStr.split("/");

    if (
        dateParts.length !== 3 ||
        !dateParts.every((part) => /^\d+$/.test(part))
    ) {
        return [true, 0, 0, 0];
    }

    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10);
    const year = parseInt(dateParts[2], 10);

    // Validate ranges
    if (
        isNaN(day) ||
        day < 1 ||
        day > 31 ||
        isNaN(month) ||
        month < 1 ||
        month > 12 ||
        isNaN(year) ||
        year < 1900 ||
        year > 2100
    ) {
        return [true, 0, 0, 0];
    }

    // Date exist
    const testDate = new Date(year, month - 1, day);
    if (
        testDate.getFullYear() !== year ||
        testDate.getMonth() !== month - 1 ||
        testDate.getDate() !== day
    ) {
        return [true, 0, 0, 0];
    }

    return [false, day, month, year];
}

// Parse timezone
function parseTimezone(timezone) {
    const MIN_TIMEZONE = -14;
    const MAX_TIMEZONE = 14;

    if (
        !Number.isInteger(timezone) ||
        timezone < MIN_TIMEZONE ||
        timezone > MAX_TIMEZONE
    ) {
        return [true, timezone];
    }
    return [false, timezone];
}

// Error catch
async function errorCatch(client, interaction, error, overwrite = null) {
    // Get data
    const interact = interaction.isAutocomplete()
        ? interaction.options.getFocused()
        : !interaction.isChatInputCommand()
        ? interaction.customId
        : interaction;
    const type = interaction.type;
    const server = interaction?.guild?.name || "Non Guild";
    const serverid = interaction?.guild?.id || "Non Guild";
    const username = interaction.user.username;
    const userid = interaction.user.id;
    const date = new Date();
    const dateFormatted = date.toLocaleString("en-GB", {
        timeZone: "Asia/Jakarta",
    });

    // Log to console
    console.log(
        client.messages.general.errorCode.replace(
            "{0}",
            `[${type}] ${interact}`
        )
    );
    console.log(
        `${client.messages.general.errorPrefix} Date: ${dateFormatted}`
    );
    console.log(
        `${client.messages.general.errorPrefix} Server: '${server}' (${serverid})`
    );
    console.log(
        `${client.messages.general.errorPrefix} Executor: '${username}' (${userid})`
    );
    console.log(error);

    // Send to developer
    const embed = descEmbed(
        client,
        `### An error occurred`,
        client.config.color.danger
    );
    embed.setTitle("An error occurred");
    embed.setDescription(null);
    embed.addFields(
        {
            name: `Error Code`,
            value: `${`${error}`.split(" ").slice(1).join(" ")}`,
            inline: false,
        },
        {
            name: `Interaction`,
            value: `[${type}] ${interact}`,
            inline: false,
        },
        {
            name: `Date`,
            value: `${dateFormatted}`,
            inline: false,
        },
        {
            name: `Server`,
            value: `'${server}' (${serverid})`,
            inline: false,
        },
        {
            name: `Executor`,
            value: `'${username}' (${userid})`,
            inline: false,
        }
    );

    const response = descEmbed(
        client,
        `${
            ["missing access", "permission", "permissions"].some((str) =>
                `${error}`.toLowerCase().includes(str)
            )
                ? `### ${`${error}`.split(" ").slice(1).join(" ")}\n${
                      client.messages.general.error
                  }`
                : ["etimedout", "timedout", "timeout"].some((str) =>
                      `${error}`.toLowerCase().includes(str)
                  )
                ? client.messages.general.serverBusy
                : client.messages.general.error
        }`,
        client.config.color.danger
    );

    // Reply interaction
    await interaction.editReply({
        content: "",
        embeds: [response],
        components: [],
        files: [],
    });
}

module.exports = {
    descEmbed,
    getData,
    postData,
    removeDuplicates,
    isValidIpAddress,
    parseTimeString,
    parseDateString,
    parseTimezone,
    errorCatch,
};
