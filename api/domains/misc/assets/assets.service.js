// First created Week 2 by Zane Beidas
// --------

import { addAssetQuery, removeAssetQuery, getAssetQuery } from './assets.queries.js';
import { validateType } from '../../../util/functions.js';
import { getPostById } from '../../feed/posts/posts.queries.js';
import { getUserById } from '../../user/auth/auth.queries.js';

export async function addAsset({ file, owner_id, owner_type, type }) {
    if (!file || !file.buffer || !file.mimetype) {
        return { status: 400, body: { message: "Invalid file" } };
    }

    try {
        validateType(owner_id, "number", "Owner ID");
        validateType(owner_type, "string", "Owner Type");
        validateType(type, "string", "Type");
    } catch (err) {
        return { status: 400, body: { message: err.message } };
    }

    try {
        const asset = await addAssetQuery(file, owner_id, owner_type, type);
        return { status: 200, body: { message: "Asset created successfully!", data: asset } };
    } catch (err) {
        return { status: 500, body: { message: "Internal server error" } };
    }
}

export async function removeAsset({ id }) {
    try {
        validateType(id, "number", "ID");
    } catch (err) {
        return { status: 400, body: { message: err.message } };
    }

    try {
        await removeAssetQuery(id);
        return { status: 200, body: { message: "Asset removed successfully!" } };
    } catch (err) {
        if (err.message === 'Asset not found') {
            return { status: 404, body: { message: "Asset not found" } };
        }

        return { status: 500, body: { message: "Internal server error" } };
    }
}

export async function getAsset(id, {user_id = -1} = {}) {
    try {
        validateType(id, "number", "ID");
    } catch (err) {
        return { status: 400, body: { message: err.message } };
    }

    try {
        const asset = await getAssetQuery(id);

        if (asset.owner_type === 'post') {
            const post = await getPostById(asset.owner_id, { user_id });
        } else if (asset.owner_type === 'user') {
            const user = await getUserById(asset.owner_id, { user_id });
        }

        return { status: 200, body: { message: "Asset retrieved successfully!", data: asset } };
    } catch (err) {
        if (err.message === 'Asset not found') {
            return { status: 404, body: { message: "Asset not found" } };
        }
        if (err.message === 'Post not found or not accessible') {
            return { status: 403, body: { message: "Post is private or not found" } };
        }
        if (err.message === 'User not found or not accessible') {
            return { status: 403, body: { message: "User is private or not found" } };
        }
    

        return { status: 500, body: { message: "Internal server error" } };
    }
}