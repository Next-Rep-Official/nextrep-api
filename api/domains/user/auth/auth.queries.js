// First created Week 1 by Zane Beidas
// --------

import pool from '../../../database/db.js';

/**
 * Creates a new user with the inputted information
 */
export async function createNewUser(username, email, hashed_password, display_name = username) {
    const { rows } = await pool.query('INSERT INTO users (username, display_name, email, hashed_password) VALUES($1, $2, $3, $4) RETURNING *', [
        username.toLocaleLowerCase(),
        display_name,
        email.toLocaleLowerCase(),
        hashed_password,
    ]);

    return rows[0];
}

/**
 * Get the user's info that is correlated with the key
 */
export async function getUserFromKey(key) {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $1 LIMIT 1', [key]);

    if (rows.length === 0) {
        const error = new Error('User not found');
        error.code = 1;
        throw error;
    }

    return rows[0];
}

/**
 * Gets a user by its id
 * @param {*} id 
 * @param {*} param1 
 * @returns 
 */
export async function getUserById(id, {user_id = -1} = {}) {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1 AND (visibility = \'public\' OR id = $2) LIMIT 1', [id, user_id ?? -1]);

    if (rows.length === 0) {
        const error = new Error('User not found or not accessible');
        error.code = 1;
        throw error;
    }
    return rows[0];
}