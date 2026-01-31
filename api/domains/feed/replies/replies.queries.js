// First created Week 2 by Zane Beidas
// --------

import pool from '../../../database/db.js'
import { runTransaction } from '../../../database/helpers/transaction.js';

/**
 * Replies to a post
 * 
 * @param {number} user_id The ID of the user creating the reply
 * @param {number} post_id The ID of the post you are replying to 
 * @param {string} body The text that you want to reply with
 * 
 * @returns The reply
 */
export async function replyToPost(user_id, post_id, body) {
    const result = await runTransaction(async (client) => {
        const { rows } = await client.query(
            "INSERT INTO replies(author_id, post_id, body) VALUES ($1, $2, $3) RETURNING *",
            [user_id, post_id, body]
        );

        await client.query(`UPDATE posts SET replies_count = replies_count + 1 WHERE id = $1`,
            [post_id]
        );
        
        return rows
    })
 
    return result[0];
}

/**
 * Replies to a reply
 * 
 * @param {number} user_id The ID of the user creating the reply
 * @param {number} reply_id The ID of the reply you are replying to 
 * @param {string} body The text that you want to reply with
 * 
 * @returns The reply
 */
export async function replyToReply(user_id, reply_id, body) {
    const result = await runTransaction(async (client) => {
        const { rows: reply_rows } = await client.query(
            "SELECT post_id FROM replies WHERE id = $1",
            [reply_id]
        );

        if (reply_rows.length === 0) {
            throw new Error('Reply not found');
        }

        const post_id = reply_rows[0].post_id;

        const { rows } = await client.query(
            "INSERT INTO replies(author_id, post_id, body, parent_id) VALUES ($1, $2, $3, $4) RETURNING *",
            [user_id, post_id, body, reply_id]
        )

        // await client.query("UPDATE posts SET replies_count = replies_count + 1 WHERE id = $1", [post_id])
        await client.query("UPDATE replies SET replies_count = replies_count + 1 WHERE id = $1", [reply_id])

        return rows;
    })

    return result[0];
}

/**
 * Pull all replies to a post
 * 
 * @param {number} post_id The ID of the post to pull replies from
 * 
 * @returns {Array} All of the resulting replies from this post
 */
export async function getRepliesFromPost(post_id) {
    const { rows } = await pool.query("SELECT * FROM replies WHERE post_id = $1", [post_id])

    if (rows.length === 0) {
        const error = new Error("No replies found")
        error.code = 1;
        throw error;
    }

    return rows;
}

/**
 * Gets all replies from another reply
 * 
 * @param {number} reply_id The ID of the reply to pull replies from
 * 
 * @returns {Array} All of the resulting replies from this reply
 */
export async function getRepliesFromReply(reply_id) {
    const { rows } = await pool.query("SELECT * FROM replies WHERE parent_id = $1", [reply_id])

    if (rows.length === 0) {
        const error = new Error("No replies found")
        error.code = 1;
        throw error;
    }

    return rows;
}

// /**
//  * Deletes a post reply
//  * 
//  * @param {number} user_id The ID of the user creating the reply
//  * @param {number} reply_id The ID of the reply you want to remove
//  * 
//  * @returns The reply
//  */
// export async function removeReplyById(user_id, reply_id) {
//     await runTransaction(async (client) => {
//         await client.query("DELETE FROM replies WHERE id = $1", [reply_id]);

//         await client.query(`UPDATE posts SET replies_count = replies_count - 1 WHERE id = $1`, [post_id]);
        
//         return rows
//     })
// }
