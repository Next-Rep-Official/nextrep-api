// First created Week 1 by Zane Beidas
// --------

import pool from '../../../database/db.js';

/**
 * Creates a new post and pushes it to the database
 *
 * @param {number} user_id The ID of the user creating the post
 * @param {string} title The title of the post
 * @param {string} body The body of the post
 */
export async function createNewPost(user_id, title, {body = ''} = {}) {
    const { rows } = await pool.query('INSERT INTO posts (author_id, title, body) VALUES ($1, $2, $3) RETURNING *', [user_id, title, body ?? '']);

    return rows[0];
}

/**
 * Gets a post by id
 *
 * @param {number} user_id
 * @param {number} post_id
 */
export async function getPostById(post_id, {user_id = -1} = {}) {
    // TODO: IMPLEMETN FRIENDS LOGIC
    const { rows } = await pool.query("SELECT * FROM posts WHERE id = $1 AND (visibility = 'public' OR author_id = $2) LIMIT 1", [post_id, user_id ?? -1]);

    if (rows.length === 0) {
        const error = new Error('Post not found or not accessible');
        error.code = 1;
        throw error;
    }

    return rows[0];
}

/**
 * Search posts by a term, including public posts and the user's own private posts
 *
 * @param {number} user_id The ID of the user performing the search
 * @param {string} search_term The search term to use
 * @param {number} limit Number of results to return
 *
 * @returns {Array} Array of post objects
 */
export async function getPostsBySearchTerm(search_term, {user_id = -1, limit = 20} = {}) {
    // Convert search term to tsquery
    const tsQuery = search_term
    .trim()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .join(' & ');

    const query = `
        SELECT *,
        ts_rank(document, to_tsquery('english', $1)) 
        AS rank 
        FROM posts 
        WHERE document @@ to_tsquery('english', $1) 
        AND (visibility = 'public' OR author_id = $2) 
        ORDER BY rank DESC 
        LIMIT $3;
    `;

    const values = [tsQuery, user_id ?? -1, limit ?? 20];

    try {
        const { rows } = await pool.query(query, values);
        return rows;
    } catch (err) {
        console.error('Error searching posts:', err);
        return [];
    }
}

/**
 * Gets the latest uploaded posts
 *
 * @param {number} user_id The ID of the user that is requestiong the posts
 * @param {string} order The order of creation dates; "ascending" or "descending"
 * @param {number} limit The limit of posts that can be resulted from this
 *
 * @returns {Array} The resulting posts
 */
export async function getPostsByOrder(order, { user_id = -1, limit = 20 } = {}) {
    const sortOrder = order === 'ascending' ? 'ASC' : 'DESC';

    const { rows } = await pool.query(
        `
            SELECT * FROM posts WHERE (visibility = 'public' OR author_id = $1) 
            ORDER BY created_at ${sortOrder} 
            LIMIT $2
        `,
        [user_id ?? -1, limit ?? 20]
    );

    return rows;
}
