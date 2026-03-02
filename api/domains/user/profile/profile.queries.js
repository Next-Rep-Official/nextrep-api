// First created Week 2 by Zane Beidas
// --------

import pool from '../../../storage/database/db.js';
import { NotFoundError, DatabaseError } from '../../../util/errors.js';


// ======== CREATE PROFILES ======== //

/**
 * Creates a new profile for a user
 */
export async function createNewProfileQuery(user_id, { client = pool } = {}) {
    const { rows } = await (client ?? pool).query('INSERT INTO profiles (user_id) VALUES ($1) RETURNING *', [user_id]);

    if (rows.length === 0) {
        throw new DatabaseError('Failed to create profile', { status: 500, code: -1 });
    }

    return rows[0];
}


// ======== GET PROFILES ======== //

/**
 * Gets a profile by its user_id
 */
export async function getProfileByUserIdQuery(user_id, { client = pool } = {}) {
    const { rows } = await (client ?? pool).query(`
        SELECT p.*, json_build_object(
            'username', u.username
        ) AS user
        FROM profiles p
        LEFT JOIN users u ON u.id = p.user_id
        WHERE p.user_id = $1 AND (u.visibility = 'public' OR p.user_id = $2)
        LIMIT 1`, [user_id, user_id ?? -1]
    )

    if (rows.length === 0) {
        throw new NotFoundError('Profile not found');
    }
    return rows[0];
}

/**
 * Gets a profile by its id
 */
export async function getProfileByIdQuery(id, { user_id = -1, client = pool } = {}) {
    const { rows } = await (client ?? pool).query(
        `SELECT p.*, json_build_object(
            'username', u.username
        ) AS user
        FROM profiles p
        LEFT JOIN users u ON u.id = p.user_id
        WHERE p.id = $1 AND (u.visibility = 'public' OR p.user_id = $2)
        LIMIT 1`, [id, user_id ?? -1]
    );

    if (rows.length === 0) {
        throw new NotFoundError('Profile not found');
    }

    return rows[0];
}


// ======== UPDATE PROFILES ======== //

/**
 * Updates the profile picture of a user
 */
export async function updateProfilePictureByUserIdQuery(user_id, profile_picture_id, { client = pool } = {}) {
    const { rows } = await (client ?? pool).query('UPDATE profiles SET profile_picture = $1 WHERE user_id = $2 RETURNING *', [profile_picture_id, user_id]);
    if (rows.length === 0) {
        throw new NotFoundError('Profile not found');
    }

    return rows[0];
}

/**
 * Updates the bio of a user
 */
export async function updateProfileBioByUserIdQuery(user_id, bio, { client = pool } = {}) {
    const { rows } = await (client ?? pool).query('UPDATE profiles SET bio = $1 WHERE user_id = $2 RETURNING *', [bio, user_id]);
    if (rows.length === 0) {
        throw new NotFoundError('Profile not found');
    }

    return rows[0];
}

/**
 * Updates the pronouns of a user
 */
export async function updateProfilePronounsByUserIdQuery(user_id, pronouns, { client = pool } = {}) {
    const { rows } = await (client ?? pool).query('UPDATE profiles SET pronouns = $1 WHERE user_id = $2 RETURNING *', [pronouns, user_id]);
    if (rows.length === 0) {
        throw new NotFoundError('Profile not found');
    }

    return rows[0];
}

/**
 * Updates the display name of a user
 */
export async function updateDisplayNameByUserIdQuery(user_id, display_name, {client = pool} = {}) {
    const { rows } = await (client ?? pool).query('UPDATE profiles SET display_name = $1 WHERE user_id = $2 RETURNING *', [display_name, user_id]);
    if (rows.length === 0) {
        throw new NotFoundError('Profile not found');
    }

    return rows[0];
}