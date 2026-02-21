// First created Week 3 by Zane Beidas
// --------

import pool from '../../../database/db.js';
import { runTransaction } from '../../../database/helpers/transaction.js';
import { NotFoundError, UniqueViolationError } from '../../../util/errors.js';


// ======== FOLLOW / UNFOLLOW USERS ======== //

/**
 * Follows a user
 */
export async function addFollowToUser(user_id, followed_id, { client } = {}) {
    const result = await runTransaction(async (c) => {
        const { rows } = await c.query(
            'INSERT INTO follows (follower_id, followed_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
            [user_id, followed_id]
        );

        if (rows.length === 0) throw new UniqueViolationError('Failed to follow user');

        await c.query('UPDATE profiles SET followers = followers + 1 WHERE user_id = $1', [followed_id]);
        await c.query('UPDATE profiles SET following = following + 1 WHERE user_id = $1', [user_id]);

        return rows[0];
    }, { client: client });

    return result;
}

/**
 * Unfollows a user
 */
export async function removeFollowFromUser(user_id, followed_id, { client } = {}) {
    const result = await runTransaction(async (c) => {
        const { rows } = await c.query(
            'DELETE FROM follows WHERE follower_id = $1 AND followed_id = $2 RETURNING *',
            [user_id, followed_id]
        );

        if (rows.length === 0) throw new NotFoundError('User not followed');

        await c.query('UPDATE profiles SET followers = followers - 1 WHERE user_id = $1', [followed_id]);
        await c.query('UPDATE profiles SET following = following - 1 WHERE user_id = $1', [user_id]);

        return rows[0];
    }, { client: client });

    return result;
}

// ======== GET FOLLOWERS / FOLLOWING ======== //

/**
 * Gets the followers of a user
 */
export async function getFollowersFromUser(id, { client, user_id = -1 } = {}) {
    const { rows } = await (client ?? pool).query(`
        SELECT fu.id AS follower_id,
               fu.username,
               json_build_object(
                   'display_name', pr.display_name,
                   'username', fu.username,
                   'profile_picture', pr.profile_picture,
                   'pronouns', pr.pronouns
               ) AS user
        FROM follows f
        JOIN users u ON u.id = f.followed_id
        JOIN users fu ON fu.id = f.follower_id
        LEFT JOIN profiles pr ON pr.user_id = f.follower_id
        WHERE f.followed_id = $1
          AND (u.visibility = 'public' OR f.followed_id = $2)
    `, [id, user_id ?? -1]);

    return rows;
}

/**
 * Gets the following users of a user
 */
export async function getFollowingFromUser(id, { client, user_id = -1 } = {}) {
    const { rows } = await (client ?? pool).query(`
        SELECT fu.id AS followed_id,
               fu.username,
               json_build_object(
                   'display_name', pr.display_name,
                   'username', fu.username,
                   'profile_picture', pr.profile_picture,
                   'pronouns', pr.pronouns
               ) AS user
        FROM follows f
        JOIN users u ON u.id = f.follower_id
        JOIN users fu ON fu.id = f.followed_id
        LEFT JOIN profiles pr ON pr.user_id = f.followed_id
        WHERE f.follower_id = $1
          AND (u.visibility = 'public' OR f.follower_id = $2)
    `, [id, user_id ?? -1]);

    return rows;
}

// *** DISCLAIMER: NO NEED FOR AUTH FOR THESE QUERIES *** //

/**
 * Gets the number of followers of a user
 */
export async function getNumberOfFollowers(id, { client } = {}) {
    const { rows } = await (client ?? pool).query('SELECT COUNT(*) FROM follows WHERE followed_id = $1', [id]);
    return Number(rows[0].count);
}

/**
 * Gets the number of following users of a user
 */
export async function getNumberOfFollowing(id, { client } = {}) {
    const { rows } = await (client ?? pool).query('SELECT COUNT(*) FROM follows WHERE follower_id = $1', [id]);
    return Number(rows[0].count);
}