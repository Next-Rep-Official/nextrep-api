// First created Week 2 by Zane Beidas
// --------

import { validateType } from '../../../util/functions.js';
import { addReplyToPost, addReplyToReply, getAllRepliesFromPost, getAllRepliesFromReply } from './replies.queries.js';

/**
 * Replies to a post
 *
 * @param {number} user_id  The id of the user
 * @param {number} post_id  The id of the post
 * @param {string} body The body of the reply
 *
 * @returns the response
 */
export async function replyToPost({ user_id, post_id, body }) {
    try {
        validateType(user_id, 'number', 'User ID');
        validateType(post_id, 'number', 'Post ID');
        validateType(body, 'string', 'Body');
    } catch (err) {
        return { status: 400, body: { message: err.message } };
    }

    try {
        await addReplyToPost(user_id, post_id, body);

        return { status: 200, body: { message: 'Reply created successfully!' } };
    } catch (err) {
        if (err.code === 23503) {
            return { status: 400, body: { message: 'Post does not exist' } };
        }

        return { status: 500, body: { message: 'Internal server error' } };
    }
}

/**
 * Replies to another reply
 *
 * @param {number} user_id  The id of the user
 * @param {number} reply_id  The id of the parent reply
 * @param {string} body The body of the reply
 *
 * @returns the response
 */
export async function replyToReply({ user_id, reply_id, body }) {
    try {
        validateType(user_id, 'number', 'User ID');
        validateType(reply_id, 'number', 'Reply ID');
        validateType(body, 'string', 'Body');
    } catch (err) {
        return { status: 400, body: { message: err.message } };
    }

    try {
        await addReplyToReply(user_id, reply_id, body);

        return { status: 200, body: { message: 'Reply created successfully!' } };
    } catch (err) {
        if (err.code === 23503) {
            return { status: 400, body: { message: 'Parent reply does not exist' } };
        }

        return { status: 500, body: { message: 'Internal server error' } };
    }
}

/**
 * Gets all replies from a post
 *
 * @param {number} post_id The id of the posts to get replies from
 *
 * @returns {Array} An array of all the replies
 */
export async function getRepliesFromPost({ post_id }) {
    try {
        validateType(post_id, 'number', 'Post ID');
    } catch (err) {
        return { status: 400, body: { message: err.message } };
    }

    try {
        const result = await getAllRepliesFromPost(post_id);

        return { status: 200, body: { message: 'Retreived replies successfully!', data: { replies: result } } };
    } catch (err) {
        if (err.code === 1) {
            return { status: 404, body: { message: 'No replies found' } };
        }

        return { status: 500, body: { message: 'Internal server error' } };
    }
}

/**
 * Gets all replies from another reply
 *
 * @param {number} reply_id The id of the reply to get replies from
 *
 * @returns {Array} An array of all the replies
 */
export async function getRepliesFromReply({ reply_id }) {
    try {
        validateType(reply_id, 'number', 'Reply ID');
    } catch (err) {
        return { status: 400, body: { message: err.message } };
    }

    try {
        const result = await getAllRepliesFromReply(reply_id);

        return { status: 200, body: { message: 'Retrieved replies successfully!', data: { replies: result } } };
    } catch (err) {
        if (err.code === 1) {
            return { status: 404, body: { message: 'No replies found' } };
        }

        return { status: 500, body: { message: 'Internal server error' } };
    }
}
