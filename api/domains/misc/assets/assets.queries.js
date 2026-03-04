// First created Week 2 by Zane Beidas
// --------

import { uploadFile, getPath } from '../../../storage/bucket/helpers/upload.js';
import pool from '../../../storage/database/db.js';
import { removeFile } from '../../../storage/bucket/helpers/remove.js';
import { runTransaction } from '../../../storage/database/helpers/transaction.js';
import { NotFoundError, DatabaseError } from "../../../util/errors.js";
import crypto from 'crypto';

// ======== CREATE ASSETS ======== //

/**
 * Creates a new asset inside the Assets bucket
 */
export async function addAssetQuery(file, owner_id, owner_type, type, { client = pool } = {}) {
    const path = getPath(owner_type, owner_id, type);
    const filename = crypto.randomUUID();
    let uploaded = false;

    try {
        const result = await runTransaction(async (c) => {
            const { rows } = await c.query(
                'INSERT INTO assets (owner_id, owner_type, type, filename) VALUES ($1, $2, $3, $4) RETURNING *',
                [owner_id, owner_type, type, filename]
            );

            if (rows.length === 0) {
                throw new DatabaseError('Failed to create asset', { code: -1, status: 500 });
            }

            await uploadFile(file, path, filename);
            uploaded = true;

            return rows[0];
        }, { client: (client ?? pool) });

        return result;
    } catch (error) {
        if (uploaded) await addS3ObjectCleanupQuery(path, filename);
        if (error.code < 0) throw error;

        throw new DatabaseError('Failed to create asset', { code: -1, status: 500 });
    }
}


// ======== REMOVE ASSETS ======== //

/**
 * Removes an asset from the database and the S3 bucket
 */
export async function removeAssetQuery(id, { client = pool } = {}) {
    let deleted = false;
    let assetPath = null;
    let assetFilename = null;

    try {
        const result = await runTransaction(async (c) => {
            const { rows } = await c.query('DELETE FROM assets WHERE id = $1 RETURNING *', [id]);
    
            if (rows.length === 0) {
                throw new NotFoundError('Asset not found');
            }
    
            const asset = rows[0];
    
            assetPath = getPath(asset.owner_type, asset.owner_id, asset.type);
            assetFilename = asset.filename;

            await removeFile(assetPath, assetFilename);
            deleted = true;

            return asset;
        }, { client: (client ?? pool) });

        return result;
    } catch (error) {
        if (deleted) {
            await addS3ObjectCleanupQuery(assetPath, assetFilename);
            throw new DatabaseError('Failed to remove asset', { code: -1, status: 500 });
        }
        if (error.code < 0) throw error;

        throw new DatabaseError('Failed to remove asset', { code: -1, status: 500 });
    }

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


// ======== ASSET CLEANUP ======== //

/**
 * Adds an S3 object (from the bucket) cleanup to the cleanup queue
 */
export async function addS3ObjectCleanupQuery(path, filename, { client = pool } = {}) {
    await (client ?? pool).query(
        'INSERT INTO cleanup_queue (action, payload) VALUES ($1, $2)',
        ['delete_s3_object', JSON.stringify({ path, filename })]
    );
}

/**
 * Adds an asset (from the database) cleanup to the cleanup queue
 */
export async function addAssetCleanupQuery(id, { client = pool } = {}) {
    await (client ?? pool).query(
        'INSERT INTO cleanup_queue (action, payload) VALUES ($1, $2)',
        ['delete_asset', JSON.stringify({ asset_id: id })]
    );
}