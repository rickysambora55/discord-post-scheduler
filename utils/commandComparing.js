module.exports = (existing, local) => {
    function arraysEqual(arr1, arr2) {
        // Check if both are null, undefined, or empty
        if ((!arr1 || arr1.length === 0) && (!arr2 || arr2.length === 0)) {
            return false;
        }

        // If one is null/undefined/empty and the other is not
        if (!arr1 || arr1.length === 0 || !arr2 || arr2.length === 0) {
            return true;
        }

        // If both arrays exist, compare their lengths and elements
        if (arr1.length !== arr2.length) {
            return true;
        }

        // Compare each element
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) {
                return true;
            }
        }

        // Arrays are equal
        return false;
    }

    // Define comparing functions
    const changed = (a, b) => JSON.stringify(a) !== JSON.stringify(b);
    const changed2 = (a, b) => {
        // Treat undefined as false
        if (b === undefined) b = false;
        if (a === undefined) a = false;
        if (b === null) b = false;
        if (a === null) a = false;

        return JSON.stringify(a) !== JSON.stringify(b);
    };
    const changedString = (a, b) => {
        if (b === undefined) b = "";
        if (a === undefined) a = "";
        if (b === null) b = "";
        if (a === null) a = "";

        return JSON.stringify(a) !== JSON.stringify(b);
    };
    const context = (array) => {
        if (array.contexts) {
            array.dmPermission = array.contexts.includes(1)
                ? true
                : array.dm_permission;
        }
    };
    const context2 = (array) => {
        if (array.contexts) {
            array.dm_permission = array.contexts.includes(1)
                ? true
                : array.dm_permission;
        }
    };

    // Check if command name or description changed
    context(existing);
    context2(local.data);

    if (existing.guild) {
        if (
            changed2(existing.name, local.data.name) ||
            changedString(existing.description, local.data.description) ||
            changed2(existing.nsfw, local.data.nsfw)
        ) {
            return true;
        }
    } else {
        if (
            changed2(existing.name, local.data.name) ||
            changedString(existing.description, local.data.description) ||
            changed2(existing.nsfw, local.data.nsfw) ||
            arraysEqual(
                existing.integrationTypes,
                local.data.integration_types
            ) ||
            arraysEqual(existing.contexts, local.data.contexts)
        ) {
            return true;
        }
    }
    // Check if the content changed
    const optionsChanged = changed(
        optionsArray(existing),
        optionsArray(local.data)
    );

    return optionsChanged;

    // Define content comparing function
    function optionsArray(cmd) {
        const cleanObject = (obj) => {
            // Loop for each key in options object
            for (const key in obj) {
                if (typeof obj[key] === "object") {
                    // Recursive loop for further key inside
                    cleanObject(obj[key]);

                    // Delete if key is empty
                    if (
                        !obj[key] ||
                        (Array.isArray(obj[key]) && obj[key].length === 0)
                    ) {
                        delete obj[key];
                    }
                } else if (obj[key] === undefined) {
                    // Delete if key is undefined
                    delete obj[key];
                }
            }
        };

        // Define normalization object functions
        const normalizeObject = (input) => {
            // Remap using the normalization object
            if (Array.isArray(input)) {
                return input.map((item) => normalizeObject(item));
            }

            // Remake the object
            const normalizedItem = {
                type: input.type,
                name: input.name,
                description: input.description,
                options: input.options
                    ? normalizeObject(input.options)
                    : undefined,
                required: input.required,
            };

            return normalizedItem;
        };

        return (cmd.options || []).map((option) => {
            // Parse the option
            let cleanedOption = JSON.parse(JSON.stringify(option));

            // Normalize the option and/or more options inside the options object
            cleanedOption.options
                ? (cleanedOption.options = normalizeObject(
                      cleanedOption.options
                  ))
                : (cleanedOption = normalizeObject(cleanedOption));

            // Detele the empty key
            cleanObject(cleanedOption);

            // Return unique options and parse it
            return {
                ...cleanedOption,
                choices: cleanedOption.choices
                    ? JSON.stringify(cleanedOption.choices.map((c) => c.value))
                    : null,
            };
        });
    }
};
