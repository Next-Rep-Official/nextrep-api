// First created Week 2 by Zane Beidas
// --------

import { addAssetQuery, removeAssetQuery, getAssetQuery } from './assets.queries.js';
import { validateType } from '../../../util/validation.js';
import { getPostById } from '../../feed/posts/posts.queries.js';
import { getUserById } from '../../user/auth/auth.queries.js';
import { getSignedUrl } from '../../../bucket/helpers/load.js';
import { getPath } from '../../../bucket/helpers/upload.js';
import { ForbiddenError, ValidationError } from '../../../util/errors.js';
import { CustomResponse } from '../../../util/response.js';


// ======== ADD ASSETS ======== //

/**
 * Adds a new asset to the database and the S3 bucket
 * 
 * @param {File} file The file to add
 * @param {number} owner_id The id of the owner
 * @param {string} owner_type The type of the owner
 * @param {string} type The type of the asset
 *
 * @returns {Promise<Object>} The created asset
 */
export async function addAsset(file, owner_id, owner_type, type) {
    try {
        validateType(owner_id, 'number', 'Owner ID');
        validateType(owner_type, 'string', 'Owner Type');
        validateType(type, 'string', 'Type');

        if (!file || !file.buffer || !file.mimetype) {
            throw new ValidationError('Invalid file');
        }

        const asset = await addAssetQuery(file, owner_id, owner_type, type);
        return new CustomResponse(200, 'Asset created successfully!', { asset }).get();
    } catch (err) {
        if (err.code < 0) {
            return new CustomResponse(err.status, err.message).get();
        }
        console.error('[assets] addAsset 500:', err?.message ?? err, err?.stack);
        return new CustomResponse(500, 'Internal server error').get();
    }
}


// ======== REMOVE ASSETS ======== //

/**
 * Removes an asset from the database and the S3 bucket
 *
 * @param {number} id The id of the asset to remove
 *
 * @returns {Promise<Object>} The removed asset
 */
export async function removeAsset(id) {
    try {
        validateType(id, 'number', 'ID');

        await removeAssetQuery(id);
        return new CustomResponse(200, 'Asset removed successfully!').get();
    } catch (err) {
        if (err.code < 0) {
            return new CustomResponse(err.status, err.message).get();
        }
        console.error('[assets] removeAsset 500:', err?.message ?? err, err?.stack);
        return new CustomResponse(500, 'Internal server error').get();
    }
}


// ======== GET ASSETS ======== //

/**
 * Gets an asset by its id
 *
 * @param {number} id The id of the asset to get
 * @param {object} { user_id = -1 } The id of the user requesting the asset
 *
 * @returns {object} The asset
 */
export async function getAsset(id, { user_id = -1 } = {}) {
    try {
        validateType(id, 'number', 'ID');

        const asset = await getAssetQuery(id);
        
        if (asset.owner_type == 'post') {
            const post = await getPostById(asset.owner_id, { user_id: Number(user_id) });

            if (post.author_id !== user_id && post.visibility === 'private') {
                throw new ForbiddenError('Post is private and you are not the author');
            }

        } else if (asset.owner_type == 'user') {
            const user = await getUserById(Number(asset.owner_id), { user_id: Number(user_id) });

            if (user.visibility === 'private' && user.id !== user_id) {
                throw new ForbiddenError('User is private and you are not the user');
            }
        }

        return new CustomResponse(200, 'Asset retrieved successfully!', { asset }).get();
    } catch (err) {
        if (err.code < 0) {
            return new CustomResponse(err.status, err.message).get();
        }
        console.error('[assets] getAsset 500:', err?.message ?? err, err?.stack);
        return new CustomResponse(500, 'Internal server error').get();
    }
}

/**
 * Gets a signed URL for an asset
 * 
 * @param {number} id The id of the asset to get the signed URL for
 * @param {object} { user_id = -1 } The id of the user requesting the asset
 *
 * @returns {Promise<Object>} A custom response object with the signed URL
 */
export async function getUrl(id, { user_id = -1 } = {}) {
    try {
        validateType(id, 'number', 'ID');

        const asset = await getAsset(id, { user_id: Number(user_id) });

        if (asset.status !== 200) {
            return asset;
        }

        const assetData = asset.body.data.asset;

        const path = getPath(assetData.owner_type, assetData.owner_id, assetData.type);

        const signedUrl = await getSignedUrl(path, assetData.filename);

        return new CustomResponse(200, 'Signed URL retrieved successfully!', { signedUrl }).get();
    } catch (err) {
        if (err.code < 0) {
            return new CustomResponse(err.status, err.message).get();
        }
        console.error('[assets] getUrl 500:', err?.message ?? err, err?.stack);
        return new CustomResponse(500, 'Internal server error').get();
    }
}