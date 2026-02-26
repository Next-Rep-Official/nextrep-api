// First created Week 1 by Zane Beidas
// --------

import { createNewPost, getPostsBySearchTerm, getPostById, getPostsByOrder, likePostById } from './posts.queries.js';
import { CustomResponse } from '../../../util/response.js';
import { ValidationError, BadRequestError } from '../../../util/errors.js';
import { validateType } from '../../../util/validation.js';
import { addAsset, removeAsset } from '../../misc/assets/assets.service.js';
import { DatabaseError } from '../../../util/errors.js';
import { getAttachmentsForPost, deletePostById } from './posts.queries.js';

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

        const post = await createNewPost(author_id, title, { body, attachment_ids, visibility });

        for (const attachment of attachments) {
            const asset = await addAsset(attachment, post[0].id, 'post', 'post_attachment');

            if (asset.status !== 200) {
                for (const attachment_id of attachment_ids) {
                    const response = await removeAsset(attachment_id);
                    if (response.status !== 200) {
                        console.error('Failed to remove asset:', response.body);
                    }
                }
                throw new DatabaseError('Failed to add asset', { status: asset.status, code: -1 });
            }
            attachment_ids.push(asset.body.data.asset.id);
        }

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