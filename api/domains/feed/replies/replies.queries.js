// First created Week 2 by Zane Beidas
// --------

import pool from '../../../database/db.js';
import { runTransaction } from '../../../database/helpers/transaction.js';
import { ValidationError, NotFoundError, DatabaseError } from '../../../util/errors.js';

// ======== CREATE REPLIES ========

/**
 * Replies to anything, depends on the options
 */
export async function addReply(user_id, body, {post_id = null, parent_id = null, client = pool} = {}) {
    if ((post_id || parent_id) == false) throw new ValidationError('Post id or parent reply is required');

    const result = await runTransaction(async (c) => {
        const { rows } = await c.query(
            `SELECT p.id AS post_id
            FROM posts p
            LEFT JOIN replies r ON r.post_id = p.id AND r.id = $2
            WHERE (
                ($1::int IS NOT NULL AND p.id = $1) OR
                ($2::int IS NOT NULL AND r.id = $2)
            )
            AND (p.visibility = 'public' OR p.author_id = $3)
            LIMIT 1;`,
            [post_id, parent_id, user_id]
        );

        if (rows.length === 0) throw new NotFoundError('Post or parent reply not found');

        const { rows: reply_rows } = await c.query('INSERT INTO replies(author_id, post_id, body, parent_id) VALUES ($1, $2, $3, $4) RETURNING *', [user_id, rows[0].post_id, body, parent_id ?? null]);

        if (!parent_id || parent_id === null) {
            await c.query(`UPDATE posts SET replies_count = replies_count + 1 WHERE id = $1`, [rows[0].post_id]);
        } else {
            await c.query(`UPDATE replies SET replies_count = replies_count + 1 WHERE id = $1`, [parent_id]);
        }

        return reply_rows;
    }, { client });

    if (result.length === 0) throw new DatabaseError('Error creating reply');

    return result[0];
}


// ======== LIKE REPLIES ========

/**
 * Likes a reply
 */
export async function likeReplyById(user_id, reply_id, { client = pool } = {}) {
    const { rows } = await (client ?? pool).query(`
        UPDATE replies r 
        JOIN posts p ON p.id = r.post_id AND p.author_id = $2 
        SET likes = likes + 1 WHERE (r.id = $1 AND (p.visibility = 'public' OR p.author_id = $2)) 
        RETURNING *
        `, [reply_id, user_id]);

    if (rows.length === 0) throw new DatabaseError('Failed to like reply', { code: -1, status: 500 });

    return rows[0];
}


// ======== GET REPLIES ========

/**
 * Pull all replies to a post
 * returns the replies and author information
 */
export async function getAllRepliesFromPost(post_id, { user_id = -1, client = pool } = {}) {
    const { rows } = await (client ?? pool).query(`
        SELECT r.*, json_build_object(
            'display_name', pr.display_name,
            'username', u.username,
            'profile_picture', pr.profile_picture,
            'pronouns', pr.pronouns
        ) AS author
        FROM replies r
        JOIN posts p ON p.id = r.post_id
        JOIN users u ON u.id = r.author_id
        LEFT JOIN profiles pr ON pr.user_id = u.id
        WHERE r.post_id = $1 AND (p.visibility = 'public' OR p.author_id = $2)
        ORDER BY r.created_at DESC;`, 
    [post_id, user_id ?? -1]);

    return rows;
}

/**
 * Gets all replies from another reply
 * returns the replies and author information
 */
export async function getAllRepliesFromReply(reply_id, { user_id = -1, client = pool } = {}) {
    const { rows } = await (client ?? pool).query(`
        SELECT r.*, json_build_object(
            'display_name', pr.display_name,
            'username', u.username,
            'profile_picture', pr.profile_picture,
            'pronouns', pr.pronouns
        ) AS author
        FROM replies r
        JOIN posts p ON p.id = r.post_id
        JOIN users u ON u.id = r.author_id
        LEFT JOIN profiles pr ON pr.user_id = u.id
        WHERE r.parent_id = $1 AND (p.visibility = 'public' OR p.author_id = $2)
        ORDER BY r.created_at DESC;`,
    [reply_id, user_id ?? -1]);

    if (rows.length === 0) throw new NotFoundError('No replies found');

    return rows;
}


// ======== DELETE REPLIES ========

/**
 * Deletes a reply
 */
export async function deleteReplyById(user_id, reply_id, { client = pool } = {}) {
    const result = await runTransaction(async (c) => {
        const { rows } = await c.query('DELETE FROM replies WHERE id = $1 AND author_id = $2 RETURNING *', [reply_id, user_id]);

        if (rows[0].parent_id === null) {
            await c.query('UPDATE posts SET replies_count = replies_count - 1 WHERE id = $1', [rows[0].post_id]);
        } else {
            await c.query('UPDATE replies SET replies_count = replies_count - 1 WHERE id = $1', [rows[0].parent_id]);
        }

        return rows[0];
    }, { client: (client ?? pool) });

    const { rows } = await (client ?? pool).query('DELETE FROM replies WHERE id = $1 AND author_id = $2 RETURNING *', [reply_id, user_id]);

    return result;
}