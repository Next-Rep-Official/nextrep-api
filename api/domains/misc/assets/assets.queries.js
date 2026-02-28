// First created Week 2 by Zane Beidas
// --------

import { uploadFile, getPath } from '../../../bucket/helpers/upload.js';
import pool from '../../../database/db.js';
import { removeFile } from '../../../bucket/helpers/remove.js';
import { runTransaction } from '../../../database/helpers/transaction.js';
import { NotFoundError, DatabaseError } from "../../../util/errors.js";


// ======== CREATE ASSETS ======== //

/**
 * Creates a new asset inside the Assets bucket
 */
export async function addAssetQuery(file, owner_id, owner_type, type, { client = pool } = {}) {
    const path = getPath(owner_type, owner_id, type);
    let filename = null;

    try {
        filename = await uploadFile(file, path);

        const { rows } = await (client ?? pool).query(
            'INSERT INTO assets (owner_id, owner_type, type, filename) VALUES ($1, $2, $3, $4) RETURNING *',
            [owner_id, owner_type, type, filename]
        );

        if (rows.length === 0) {
            throw new DatabaseError('Failed to create asset', { code: -1, status: 500 });
        }

        return rows[0];
    } catch (error) {
        if (filename) {
            await removeFile(path, filename);
        }

        throw new DatabaseError('Failed to create asset', { code: -1, status: 500 });
    }
}


// ======== REMOVE ASSETS ======== //

/**
 * Removes an asset from the database and the S3 bucket
 */
export async function removeAssetQuery(id, { client = pool } = {}) {
    await runTransaction(async (c) => {
        const { rows } = await c.query('DELETE FROM assets WHERE id = $1 RETURNING *', [id]);

        if (rows.length === 0) {
            throw new NotFoundError('Asset not found');
        }

        const asset = rows[0];

        const path = getPath(asset.owner_type, asset.owner_id, asset.type);
        await removeFile(path, asset.filename);
    }, { client: (client ?? null) });
}

// ======== GET ASSETS ======== //

/**
 * Gets an asset by its id
 */
export async function getAssetQuery(id, { client = pool } = {}) {
    const { rows } = await (client ?? pool).query(`
        SELECT a.*,
        json_build_object('author_id', p.author_id, 'visibility', p.visibility) AS post,
        json_build_object('id', u.id, 'visibility', u.visibility) AS user
        FROM assets a
        LEFT JOIN posts p ON p.id = a.owner_id AND a.owner_type = 'post'
        LEFT JOIN users u ON u.id = a.owner_id AND a.owner_type = 'user'
        WHERE a.id = $1
        LIMIT 1
        `, [id]);
    if (rows.length === 0) {
        throw new NotFoundError('Asset not found');
    }
    return rows[0];
}
