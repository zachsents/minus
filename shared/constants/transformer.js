

export const CUSTOM_TRANSFORMER_MODE = "Custom"

export const TRANSFORMER_MODES = {
    [CUSTOM_TRANSFORMER_MODE]: value => value,
    "First item in list": value => mustBeArray(value, arr => arr.at(0)),
    "Last item in list": value => mustBeArray(value, arr => arr.at(-1)),
    "Flatten list (one level)": value => mustBeArray(value, arr => arr.flat()),
    "Flatten list (deep)": value => mustBeArray(value, arr => arr.flat(Infinity)),
    "Convert to JSON": value => JSON.stringify(value),
    "Parse JSON": value => JSON.parse(value),
}

/**
 * @param {*} value
 * @param {(value: *[]) => *} callback
 */
function mustBeArray(value, callback) {
    return Array.isArray(value) ? callback(value) : null
}