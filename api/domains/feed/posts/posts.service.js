// First created Week 1 by Zane Beidas
// --------

import { createNewPost, getPostsBySearchTerm, getPostById, getPostsByOrder, likePostById, addPostAttachments, getPostsByAuthorId } from './posts.queries.js';
import { CustomResponse } from '../../../util/response.js';
import { ValidationError, BadRequestError } from '../../../util/errors.js';
import { validateType } from '../../../util/validation.js';
import { addAsset, removeAsset } from '../../misc/assets/assets.service.js';
import { DatabaseError } from '../../../util/errors.js';
import { getAttachmentsForPost, deletePostById } from './posts.queries.js';
import { runTransaction } from '../../../storage/database/helpers/transaction.js';
// ======== CREATE POSTS ======== //

/**
 * Creates a new post
 *
 * @param {int} author_id The ID of the user creating the post
 * @param {string} title The title of the post
 * @param {string} body The text inside the post
 *
 * @returns Status and body of response
 */
export async function createPost(author_id, title, { body = '', attachments = [], visibility = 'private' } = {}) {
    // Rollback fucntion
    const rollbackLoop = async (attachment_ids, client, status) => {
        for (const attachment_id of attachment_ids) {
            const response = await removeAsset(attachment_id, { client: client });
            if (response.status !== 200) {
                console.error('❌ Failed to remove asset:', response.body);
            }
        }

        throw new DatabaseError('Failed to add asset', { status: status, code: -1 });
    }

    // Create the post
    try {
        if (!author_id || !title) throw new ValidationError('Please input a author_id and title');

        validateType(author_id, 'number', 'Author ID');
        validateType(title, 'string', 'Title');
        validateType(body, 'string', 'Body');
        validateType(visibility, 'string', 'Visibility');

        if (attachments.length > 3) throw new ValidationError('You can only have up to 3 attachments');

        if (visibility !== 'private' && visibility !== 'public') {
            throw new BadRequestError('Invalid visibility');
        }

        for (const attachment of attachments) {
            if (attachment.buffer === undefined || attachment.mimetype === undefined) {
                throw new ValidationError('Attachment must be a file');
            }
        }

        let attachment_ids = [];
        await runTransaction(async (c) => {
            const post = await createNewPost(author_id, title, { body, visibility, client: c });

            for (const attachment of attachments) {
                const asset = await addAsset(attachment, post.id, 'post', 'post_attachment', { client: c });

                if (asset.status !== 200) {
                    await rollbackLoop(attachment_ids, c, asset.status);
                }

                attachment_ids.push(asset.body.data.asset.id);
            }

            await addPostAttachments(post.id, attachment_ids, { client: c });
        });

        return new CustomResponse(200, 'Post created successfully!').get();
    } catch (err) {
        // If theres no user then
        if (err.code == 23503) {
            return new CustomResponse(400, 'User does not exist').get();
        }

        if (err.code < 0) {
            return new CustomResponse(err.status, err.message).get();
        }

        return new CustomResponse(500, 'Internal server error').get();
    }
}

/**
 * Likes a post
 * 
 * @param {number} user_id The ID of the user liking the post
 * @param {number} post_id The ID of the post to like
 *
 * @returns Status and body of response
 */
export async function likePost(user_id, post_id) {
    try {
        validateType(user_id, 'number', 'User ID');
        validateType(post_id, 'number', 'Post ID');

        const result = await likePostById(user_id, post_id);

        return new CustomResponse(200, 'Post liked successfully!', { post: result }).get();
    } catch (err) {
        if (err.code == 23505) {
            return new CustomResponse(400, 'You have already liked this post').get();
        }

        if (err.code < 0) {
            return new CustomResponse(err.status, err.message).get();
        }

        return new CustomResponse(500, 'Internal server error').get();
    } 
}


// ======== GET POSTS ======== //

/**
 * Get all posts visible to the requesting user
 *
 * @param {int} user_id The ID of the user requesting the post
 * @param {int} post_id The ID of the post
 *
 * @returns Status and body of response
 */
export async function getPost(post_id, { user_id = -1 } = {}) {
    try {
        validateType(post_id, 'number', 'Post ID');

        const post = await getPostById(post_id, { user_id: user_id ?? -1 });

        return new CustomResponse(200, 'Successfully retrieved post!', { post }).get();
    } catch (err) {
        if (err.code < 0) {
            return new CustomResponse(err.status, err.message).get();
        }

        return new CustomResponse(500, 'Internal server error').get();
    }
}

/**
 * Search for posts with a search term
 *
 * @param {number} user_id The ID of the user searching
 * @param {string} search_term The term to search with
 * @param {number} limit Default to 20, the limit of how many results there can be
 *
 * @returns Status and body of response
 */
export async function searchPosts(search_term, { user_id = -1, limit = 20 } = {}) {
    try {
        validateType(search_term, 'string', 'Search Term');

        if (!search_term) throw new ValidationError('Please input a search term and limit');
        if ((limit ?? 20) < 1) throw new ValidationError('Limit must be at least 1');

        const result = await getPostsBySearchTerm(search_term, { user_id: user_id ?? -1, limit: limit ?? 20 });
        
        return new CustomResponse(200, 'Successfully found posts!', { posts: result }).get();
    } catch (err) {
        if (err.code < 0) {
            return new CustomResponse(err.status, err.message).get();
        }

        return new CustomResponse(500, 'Internal server error').get();
    }
}

/**
 * Get latest uploaded posts
 *
 * @param {number} user_id the id of the user requesting posts
 * @param {string} order the order of the posts; "ascending" or "descending"
 * @param {number} limit the limit of resulting posts
 *
 * @returns
 */
export async function getPosts(order, { limit = 20, user_id = -1 } = {}) {
    try {
        validateType(order, 'string', 'Order');
        validateType(limit, 'number', 'Limit');

        if (!order) throw new ValidationError('Please input an order');
        if ((limit ?? 20) < 1) throw new ValidationError('Limit must be at least 1');

        const result = await getPostsByOrder(order, { user_id: user_id ?? -1, limit: limit ?? 20 });

        return new CustomResponse(200, 'Successfully found posts!', { posts: result }).get();
    } catch (err) {
        if (err.code < 0) {
            return new CustomResponse(err.status, err.message).get();
        }

        return new CustomResponse(500, 'Internal server error').get();
    }
}

/**
 * Get all posts by a user
 *
 * @param {number} author_id The ID of the user
 * @param {number} limit The limit of posts to return
 * @param {number} user_id The ID of the user requesting the posts
 * @param {string} order The order of the posts
 * 
 * @returns Status and body of response
 */
export async function getPostsByUser(author_id, { limit = 20, user_id = -1, order = 'descending'} = {}) {
    try {
        validateType(author_id, 'number', 'Author ID');
        validateType(limit, 'number', 'Limit');
        validateType(user_id, 'number', 'User ID');
        validateType(order, 'string', 'Order');

        const result = await getPostsByAuthorId(author_id, { limit: limit ?? 20, user_id: user_id ?? -1, order: order ?? 'descending' });

        return new CustomResponse(200, 'Successfully found posts!', { posts: result }).get();
    } catch (err) {
        if (err.code < 0) {
            return new CustomResponse(err.status, err.message).get();
        }

        return new CustomResponse(500, 'Internal server error').get();
    }
}


// ======== GET POST ATTACHMENTS ======== //

/**
 * Get all attachments for a post
 *
 * @param {number} post_id The id of the post
 * @param {number} user_id The id of the user requesting the attachments
 *
 * @returns Status and body of response
 */
export async function getAttachments(post_id, { user_id = -1 } = {}) {
    try {
        validateType(post_id, 'number', 'Post ID');
        validateType(user_id, 'number', 'User ID');

        const attachments = await getAttachmentsForPost(post_id, { user_id: user_id ?? -1 });

        return new CustomResponse(200, 'Successfully found attachments!', { attachments }).get();
    } catch (err) {
        if (err.code < 0) {
            return new CustomResponse(err.status, err.message).get();
        }
        return new CustomResponse(500, 'Internal server error').get();
    }
}

// ======== DELETE POSTS ======== //

/**
 * Deletes a post
 *
 * @param {number} post_id The id of the post to delete
 * @param {number} user_id The id of the user deleting the post
 *
 * @returns Status and body of response
 */
export async function deletePost(user_id, post_id) {
    try {
        validateType(post_id, 'number', 'Post ID');
        validateType(user_id, 'number', 'User ID');

        await deletePostById(user_id, post_id);

        return new CustomResponse(200, 'Post deleted successfully!').get();
    } catch (err) {
        if (err.code < 0) {
            return new CustomResponse(err.status, err.message).get();
        }

        return new CustomResponse(500, 'Internal server error').get();
    }
}