// First created Week 1 by Zane Beidas
// --------

import pool from '../../../database/db.js';
import { DatabaseError, NotFoundError } from '../../../util/errors.js';
import { runTransaction } from '../../../database/helpers/transaction.js';
import { removeAsset } from '../../misc/assets/assets.service.js';


// ======== CREATE POSTS ======== //

/**
 * Creates a new post and pushes it to the database
 */
export async function createNewPost(user_id, title, { body = '', attachment_ids = [], client } = {}) {
    const result = await runTransaction(async (c) => {
        const { rows } = await c.query('INSERT INTO posts (author_id, title, body) VALUES ($1, $2, $3) RETURNING *', [user_id, title, body ?? '']);

        if (rows.length === 0) throw new DatabaseError('Failed to create post', { code: -1, status: 500 });

        for (const attachment_id of attachment_ids) {
            await c.query('INSERT INTO post_attachments (post_id, asset_id) VALUES ($1, $2)', [rows[0].id, attachment_id]);
        }

        return rows[0];
    }, { client: (client ?? pool) });

    if (!result) throw new DatabaseError('Failed to create post', { code: -1, status: 500 });

    return result;
}


// ======== GET POSTS ======== //

/**
 * Gets a post by id
 */
export async function getPostById(post_id, { user_id = -1, client = pool } = {}) {
    const { rows } = await (client ?? pool).query(
        "SELECT * FROM posts WHERE id = $1 AND (visibility = 'public' OR author_id = $2) LIMIT 1",
        [post_id, user_id ?? -1]
    );

    if (rows.length === 0) {
        throw new NotFoundError('Post not found or not accessible');
    }

    return rows[0];
}

/**
 * Search posts by a term, including public posts and the user's own private posts
 */
export async function getPostsBySearchTerm(search_term, { user_id = -1, limit = 20, client = pool } = {}) {
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

    const { rows } = await (client ?? pool).query(query, values);

    if (rows.length === 0) {
        throw new NotFoundError('No posts found');
    }

    return rows;
}

/**
 * Gets the latest uploaded posts
 */
export async function getPostsByOrder(order, { user_id = -1, limit = 20, client = pool } = {}) {
    const sortOrder = order === 'ascending' ? 'ASC' : 'DESC';
    
    const { rows } = await (client ?? pool).query(
        `
            SELECT * FROM posts WHERE (visibility = 'public' OR author_id = $1) 
            ORDER BY created_at ${sortOrder} 
            LIMIT $2
        `,
        [user_id ?? -1, limit ?? 20]
    );

    if (rows.length === 0) {
        throw new NotFoundError('No posts found');
    }

    return rows;
}

// ======== GET POST ATTACHMENTS ======== //

/**
 * Gets all attachments for a post
 */
export async function getAttachmentsForPost(post_id, { user_id = -1, client = pool } = {}) {
    const { rows } = await (client ?? pool).query(
        `SELECT pa.*
         FROM post_attachments pa
         JOIN posts p ON p.id = pa.post_id
         WHERE pa.post_id = $1
           AND (p.visibility = 'public' OR p.author_id = $2)`,
        [post_id, user_id ?? -1]
    );

    if (rows.length === 0) throw new NotFoundError('No attachments found');

    return rows;
}

// ======== DELETE POSTS ======== //

/**
 * Deletes a post
 */
export async function deletePostById(user_id, post_id, { client = pool } = {}) {
    const { rows } = await (client ?? pool).query('DELETE FROM posts WHERE id = $1 AND author_id = $2 RETURNING *', [post_id, user_id ?? -1]);
        
    if (rows.length === 0) throw new NotFoundError('Post not found');
}