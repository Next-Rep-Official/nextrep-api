// First created Week 2 by Zane Beidas
// --------

import { ValidationError } from './errors.js';

/**
 * Checks if a type is what is expected
 *
 * @param {*} value The value you want to check
 * @param {String} type The type of the expected value
 *
 * @throws an error if the types do not match
 */
export function validateType(value, type, name = 'Value') {
    if (!value) throw new ValidationError(name + ' is required');
    if (value === undefined) throw new ValidationError(name + ' is undefined');
    
    if (typeof value != type) {
        throw new ValidationError(name + ' must be of type ' + type);
    }
}
