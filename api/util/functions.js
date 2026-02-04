// First created Week 2 by Zane Beidas
// --------

/**
 * Checks if a type is what is expected
 *
 * @param {*} value The value you want to check
 * @param {String} type The type of the expected value
 *
 * @throws an error if the types do not match
 */
export function validateType(value, type, name = 'Value') {
    if (typeof value != type) {
        throw new Error(name + ' must be of type ' + type);
    }
}
