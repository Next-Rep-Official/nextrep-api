// First created Week 1 by Zane Beidas
// --------

import { createNewPost, getPostsBySearchTerm, getPostById, getPostsByOrder } from './posts.queries.js';
import { CustomResponse } from '../../../util/response.js';
import { ValidationError } from '../../../util/errors.js';
import { validateType } from '../../../util/validation.js';

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
export async function createPost(author_id, title, { body = '' } = {}) {
    // Create the post
    try {
        if (!author_id || !title) throw new ValidationError('Please input a author_id and title');

        validateType(author_id, 'number', 'Author ID');
        validateType(title, 'string', 'Title');
        validateType(body, 'string', 'Body');

        await createNewPost(author_id, title, { body });

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
