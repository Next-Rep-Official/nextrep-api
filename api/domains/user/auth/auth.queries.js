// First created Week 1 by Zane Beidas
// --------

import pool from '../../../database/db.js';
import { runTransaction } from '../../../database/helpers/transaction.js';
import { createNewProfileQuery } from '../profile/profile.queries.js';
/**
 * Creates a new user with the inputted information
 */
export async function createNewUser(username, email, hashed_password) {
    const result = await runTransaction(async (client) => {
        const { rows } = await client.query(
            'INSERT INTO users (username, email, hashed_password) VALUES($1, $2, $3) RETURNING *',
            [username.toLocaleLowerCase(), email.toLocaleLowerCase(), hashed_password]
        );

        if (rows.length === 0) {
            throw new Error('Failed to create user');
        }

        // await client.query('INSERT INTO profiles (user_id) VALUES($1)', [rows[0].id]);
        await createNewProfileQuery(rows[0].id, { client });

        return rows[0];
    });

    return result;
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
 * @param {number} id the ID of the user to get
 * @param {number} user_id the ID of the user requesting the user
 * @returns
 */
export async function getUserById(id, { user_id = -1 } = {}) {
    const { rows } = await pool.query(
        "SELECT * FROM users WHERE id = $1 AND (visibility = 'public' OR id = $2) LIMIT 1",
        [id, user_id ?? -1]
    );

    if (rows.length === 0) {
        const error = new Error('User not found or not accessible');
        error.code = 1;
        throw error;
    }
    return rows[0];
}
