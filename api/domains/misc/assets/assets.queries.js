// First created Week 2 by Zane Beidas
// --------

import { uploadFile } from '../../../bucket/helpers/upload.js';
import pool from '../../../database/db.js';
import { removeFile } from '../../../bucket/helpers/remove.js';
import { runTransaction } from '../../../database/helpers/transaction.js';

/**
 * Creates a new asset inside the Assets bucket
 *
 * @param {File} file the file to upload
 * @param {number} owner_id the ID of the owner
 * @param {string} owner_type the type of the owner
 * @param {string} type the type of the asset
 */
export async function addAssetQuery(file, owner_id, owner_type, type) {
    const path = `assets/${owner_type}/${owner_id}/${type}`;
    let filename = null;

    try {
        filename = await uploadFile(file, path);
        const { rows } = await pool.query(
            'INSERT INTO assets (owner_id, owner_type, type, filename) VALUES ($1, $2, $3, $4) RETURNING *',
            [owner_id, owner_type, type, filename]
        );
        return rows[0];
    } catch (error) {
        if (filename) {
            await removeFile(path, filename);
        }
        throw error;
    }
}

/**
 * Removes an asset from the database and the S3 bucket
 *
 * @param {number} id the ID of the asset to remove
 */
export async function removeAssetQuery(id) {
    await runTransaction(async (client) => {
        const { rows } = await client.query('DELETE FROM assets WHERE id = $1 RETURNING *', [id]);
        if (rows.length === 0) {
            throw new Error('Asset not found');
        }

        const asset = rows[0];

        const path = `assets/${asset.owner_type}/${asset.owner_id}/${asset.type}`;
        await removeFile(path, asset.filename);
    });
}

export async function getAssetQuery(id) {
    const { rows } = await pool.query('SELECT * FROM assets WHERE id = $1 LIMIT 1', [id]);
    if (rows.length === 0) {
        throw new Error('Asset not found');
    }
    return rows[0];
}
