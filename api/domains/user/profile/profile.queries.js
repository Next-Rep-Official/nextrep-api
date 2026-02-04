// First created Week 2 by Zane Beidas
// --------

import pool from '../../../database/db.js';

/**
 * Creates a new profile for a user
 *
 * @param {number} user_id the ID of the user
 */
export async function createNewProfileQuery(user_id, { client = pool } = {}) {
    const { rows } = await (client ?? pool).query('INSERT INTO profiles (user_id) VALUES ($1) RETURNING *', [user_id]);
    if (rows.length === 0) {
        throw new Error('Failed to create profile');
    }

    return rows[0];
}

/**
 * Gets a profile by its user_id
 *
 * @param {number} user_id the ID of the user
 * @returns {Promise<Object>} the profile
 */
export async function getProfileByUserIdQuery(user_id) {
    const { rows } = await pool.query('SELECT * FROM profiles WHERE user_id = $1 LIMIT 1', [user_id]);
    if (rows.length === 0) {
        throw new Error('Profile not found');
    }
    return rows[0];
}

/**
 * Gets a profile by its id
 *
 * @param {number} id the ID of the profile
 * @param {number} user_id the ID of the user requesting the profile
 *
 * @returns {Promise<Object>} the profile
 */
export async function getProfileByIdQuery(id, { user_id = -1 } = {}) {
    const { rows } = await pool.query(
        `SELECT p.*
         FROM profiles p
         INNER JOIN users u ON u.id = p.user_id
         WHERE p.id = $1 AND (u.visibility = 'public' OR p.user_id = $2)
         LIMIT 1`,
        [id, user_id]
    );

    if (rows.length === 0) {
        throw new Error('Profile not found');
    }

    return rows[0];
}

/**
 * Updates the profile picture of a user
 * 
 * @param {number} user_id the ID of the user
 * @param {number} profile_picture_id the ID of the profile picture
 * @param {import('pg').PoolClient} client the database client
 * @returns {Promise<Object>} the updated profile
 */
export async function updateProfilePictureByUserIdQuery(user_id, profile_picture_id, {client = pool} = {}) {
    const { rows } = await (client ?? pool).query('UPDATE profiles SET profile_picture = $1 WHERE user_id = $2 RETURNING *', [profile_picture_id, user_id]);
    if (rows.length === 0) {
        throw new Error('Failed to update profile');
    }

    return rows[0];
}

/**
 * Updates the bio of a user
 * 
 * @param {number} user_id the ID of the user
 * @param {string} bio the bio of the user
 * @param {import('pg').PoolClient} client the database client
 * @returns {Promise<Object>} the updated profile
 */
export async function updateProfileBioByUserIdQuery(user_id, bio, {client = pool} = {}) {
    const { rows } = await (client ?? pool).query('UPDATE profiles SET bio = $1 WHERE user_id = $2 RETURNING *', [bio, user_id]);
    if (rows.length === 0) {
        throw new Error('Failed to update profile');
    }

    return rows[0];
}

/**
 * updates the pronounds of a user
 * 
 * @param {*} user_id 
 * @param {*} pronouns 
 * @param {*} param2 
 * @returns 
 */
export async function updateProfilePronounsByUserIdQuery(user_id, pronouns, {client = pool} = {}) {
    const { rows } = await (client ?? pool).query('UPDATE profiles SET pronouns = $1 WHERE user_id = $2 RETURNING *', [pronouns, user_id]);
    if (rows.length === 0) {
        throw new Error('Failed to update profile');
    }

    return rows[0];
}

/**
 * 
 * @param {*} user_id 
 * @param {*} display_name 
 * @param {*} param2 
 * @returns 
 */
export async function updateDisplayNameByUserIdQuery(user_id, display_name, {client = pool} = {}) {
    const { rows } = await (client ?? pool).query('UPDATE profiles SET display_name = $1 WHERE user_id = $2 RETURNING *', [display_name, user_id]);
    if (rows.length === 0) {
        throw new Error('Failed to update profile');
    }

    return rows[0];
}