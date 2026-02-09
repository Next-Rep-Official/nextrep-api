// First created Week 1 by Zane Beidas
// --------

import pool from '../../../database/db.js';
import { runTransaction } from '../../../database/helpers/transaction.js';
import { createNewProfileQuery } from '../profile/profile.queries.js';
import { NotFoundError } from '../../../util/errors.js';



// ======== CREATE USERS ======== //

/**
 * Creates a new user with the inputted information
 */
export async function createNewUser(username, email, hashed_password, { client = pool } = {}) {
    // Run a transaction to create the user and profile
    const result = await runTransaction(async (c) => {
        const { rows } = await c.query(
            'INSERT INTO users (username, email, hashed_password) VALUES($1, $2, $3) RETURNING *',
            [username.toLocaleLowerCase(), email.toLocaleLowerCase(), hashed_password]
        );

        // If no rows are found, throw an error
        if (rows.length === 0) {
            throw new DatabaseError('Failed to create user', { status: 500, code: -1 });
        }

        await createNewProfileQuery(rows[0].id, { client: c });

        return rows[0];
    }, { client: (client ?? pool) });

    return result;
}


// ======== GET USERS ======== //

/**
 * Get the user's info that is correlated with the key
 */
export async function getUserFromKey(key, { client = pool } = {}) {
    // Get the rows from the database that match the key
    const { rows } = await (client ?? pool).query('SELECT * FROM users WHERE email = $1 OR username = $1 LIMIT 1', [key]);

    // If no rows are found, throw an error
    if (rows.length === 0) {
        throw new NotFoundError('User not found');
    }

    return rows[0];
}

/**
 * Gets a user by its id
 */
export async function getUserById(id, { user_id = -1, client = pool } = {}) {
    // Get the rows from the database that match the id and are visible to that user
    const { rows } = await (client ?? pool).query(
        "SELECT id, username FROM users WHERE id = $1 AND (visibility = 'public' OR id = $2) LIMIT 1",
        [id, user_id ?? -1]
    );

    // If no rows are found, throw an error
    if (rows.length === 0) {
        throw new NotFoundError('User not found or not accessible');
    }

    return rows[0];
}

/**
 * Searches for users by a search term
 */
export async function searchUsersByTerm(term, { user_id = -1, client = pool } = {}) {
    const { rows } = await (client ?? pool).query(
        "SELECT id, username FROM users WHERE username ILIKE $1 AND (visibility = 'public' OR id = $2) LIMIT 10",
        ["%" + term.trim() + "%", user_id ?? -1]
    );

    return rows;
}