// First created Week 1 by Zane Beidas
// --------

import { createNewPost, getPostsBySearchTerm, getPostById, getPostsByOrder } from './posts.queries.js';

/**
 * Creates a new post
 *
 * @param {int} author_id The ID of the user creating the post
 * @param {string} title The title of the post
 * @param {string} body The text inside the post
 *
 * @returns Status and body of response
 */
export async function createPost({ author_id, title, body = "" }) {
    // Initial checks
    if (!author_id || !title) return { status: 400, body: { message: 'Please input a author_id and title' } };

    // Type checks
    if (typeof author_id != 'number') {
        return { status: 400, body: { message: 'Author ID must be a number value' } };
    }
    if (typeof title != 'string') {
        return { status: 400, body: { message: 'Title must be a string value' } };
    }
    if (typeof body != 'string') {
        return { status: 400, body: { message: 'Body must be a string value' } };
    }

    // Create the post
    try {
        await createNewPost(author_id, title, { body });

        return { status: 200, body: { message: 'Post created successfully!' } };
    } catch (err) {
        // If theres no user then
        if (err.code == 23503) {
            return { status: 400, body: { message: 'User does not exist' } };
        }

        return { status: 500, body: { message: 'Internal server error' } };
    }
}

/**
 * Get all posts visible to the requesting user
 *
 * @param {int} user_id The ID of the user requesting the post
 * @param {int} post_id The ID of the post
 *
 * @returns Status and body of response
 */
export async function getPost({ user_id, post_id }) {
    if (typeof user_id != 'number' || typeof post_id != 'number') {
        return { status: 400, body: { message: 'IDs must be number values' } };
    }

    try {
        const post = await getPostById(post_id, { user_id });

        return { status: 200, body: { message: 'Successfully retrieved post!', data: { post } } };
    } catch (err) {
        if (err.code === -1) {
            return { status: 400, body: { message: 'No post with this ID' } };
        }

        return { status: 500, body: { message: 'Internal server error' } };
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
export async function searchPosts({ user_id, search_term, limit = 20 }) {
    if (!search_term || !user_id) {
        return { status: 400, body: { message: 'Search term and user id are required' } };
    }

    if (typeof user_id != 'number') {
        return { status: 400, body: { message: 'ID of user must be a number value' } };
    }
    if (typeof search_term != 'string') {
        return { status: 400, body: { message: 'Search term must be a string value' } };
    }
    if (typeof limit != 'number') {
        return { status: 400, body: { message: 'Limit must be a number value' } };
    }

    try {
        const result = await getPostsBySearchTerm(search_term, { user_id, limit });

        if (result.length === 0) {
            return { status: 404, body: { message: 'No posts found' } };
        }

        return { status: 200, body: { message: 'Successfully found posts!', data: { posts: result } } };
    } catch (err) {
        return { status: 500, body: { message: 'Internal server error' } };
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
export async function getPosts({ user_id, order, limit = 20 }) {
    // Type checks
    if (typeof user_id != 'number') {
        return { status: 400, body: { message: 'ID of user must be a number value' } };
    }
    if (typeof order != 'string' || !(order == 'ascending' || order == 'descending')) {
        return { status: 400, body: { message: 'Order must be a string value that is either "ascending" or "descending"' } };
    }
    if (typeof limit != 'number') {
        return { status: 400, body: { message: 'Limit must be a number value' } };
    }

    try {
        const result = await getPostsByOrder(order, { user_id, limit }); 

        if (!result || result.length === 0) {
            return { status: 404, body: { message: 'No posts found' } };
        }

        return { status: 200, body: { message: 'Successfully found posts!', data: { posts: result } } };
    } catch (err) {
        return { status: 500, body: { message: 'Internal server error' } };
    }
}
