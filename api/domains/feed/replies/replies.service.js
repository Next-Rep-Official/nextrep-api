// First created Week 2 by Zane Beidas
// --------

import { validateType } from '../../../util/validation.js';
import { addReply, getAllRepliesFromPost, getAllRepliesFromReply } from './replies.queries.js';
import { CustomResponse } from '../../../util/response.js';

// ======== CREATE REPLIES ========

/**
 * Replies to a post
 *
 * @param {number} user_id  The id of the user
 * @param {number} post_id  The id of the post
 * @param {string} body The body of the reply
 *
 * @returns the response
 */
export async function replyToPost(user_id, post_id, body) {
    try {
        validateType(user_id, 'number', 'User ID');
        validateType(post_id, 'number', 'Post ID');
        validateType(body, 'string', 'Body');

        const reply = await addReply(user_id, body, { post_id });

        return new CustomResponse(200, 'Reply created successfully!', { reply }).get();
    } catch (err) {
        if (err.code === 23503) {
            return new CustomResponse(400, 'Post does not exist').get();
        }

        if (err.code < 0) {
            return new CustomResponse(err.status, err.message).get();
        }

        return new CustomResponse(500, 'Internal server error' + err.message).get();
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
export async function replyToReply(user_id, reply_id, body) {
    try {
        validateType(user_id, 'number', 'User ID');
        validateType(reply_id, 'number', 'Reply ID');
        validateType(body, 'string', 'Body');
        
        const reply = await addReply(user_id, body, { parent_id: reply_id });

        return new CustomResponse(200, 'Reply created successfully!', { reply }).get();
    } catch (err) {
        if (err.code === 23503) {
            return new CustomResponse(400, 'Parent reply does not exist').get();
        }

        if (err.code < 0) {
            return new CustomResponse(err.status, err.message).get();
        }

        return new CustomResponse(500, 'Internal server error').get();
    }
}


// ======== GET REPLIES ========

/**
 * Gets all replies from a post
 *
 * @param {number} post_id The id of the posts to get replies from
 *
 * @returns {Array} An array of all the replies
 */
export async function getRepliesFromPost(post_id, { user_id = -1 } = {}) {
    try {
        validateType(post_id, 'number', 'Post ID');

        const result = await getAllRepliesFromPost(post_id, { user_id: user_id ?? -1 });

        return new CustomResponse(200, 'Retrieved replies successfully!', { replies: result }).get();
    } catch (err) {
        if (err.code < 0) {
            return new CustomResponse(err.status, err.message).get();
        }

        return new CustomResponse(500, 'Internal server error').get();
    }
}

/**
 * Gets all replies from another reply
 *
 * @param {number} reply_id The id of the reply to get replies from
 *
 * @returns {Array} An array of all the replies
 */
export async function getRepliesFromReply(reply_id, { user_id = -1 } = {}) {
    try {
        validateType(reply_id, 'number', 'Reply ID');

        const result = await getAllRepliesFromReply(reply_id, { user_id: user_id ?? -1 });

        return new CustomResponse(200, 'Retrieved replies successfully!', { replies: result }).get();
    } catch (err) {
        if (err.code < 0) {
            return new CustomResponse(err.status, err.message).get();
        }

        return new CustomResponse(500, 'Internal server error').get();
    }
}
