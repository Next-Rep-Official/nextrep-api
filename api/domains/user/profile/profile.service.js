// First created Week 2 by Zane Beidas
// --------

import {  getProfileByUserIdQuery, getProfileByIdQuery, updateProfilePictureByUserIdQuery, updateProfileBioByUserIdQuery, updateProfilePronounsByUserIdQuery, updateDisplayNameByUserIdQuery } from './profile.queries.js';
import { validateType } from '../../../util/functions.js';
import { addAsset, removeAsset } from '../../misc/assets/assets.service.js';

/**
 * Updates a user's profile picture
 * @param {number} user_id the ID of the user
 * @param {File} profile_picture 
 * @returns {Promise<Object>} the updated profile
 */
export async function updateProfilePicture(user_id, profile_picture) {
    try {
        validateType(user_id, 'number', 'User ID');
        validateType(profile_picture, 'object', 'Profile Picture');
    } catch (err) {
        return { status: 400, body: { message: err.message } };
    }

    if (profile_picture.buffer === undefined || profile_picture.mimetype === undefined) {
        return {
            status: 400,
            body: { message: 'Profile picture must be a file' },
        };
    }

    let asset = null;

    try {
        asset = await addAsset({ file: profile_picture, owner_id: user_id, owner_type: 'user', type: 'profile_picture' });

        if (asset.status !== 200) {
            return { status: asset.status, body: { message: asset.body.message } };
        }

        const updatedProfile = await updateProfilePictureByUserIdQuery(user_id, asset.body.data.id);

        return { status: 200, body: { message: 'Profile picture updated successfully', data: updatedProfile } };
    } catch (err) {
        if (asset) {
            await removeAsset({id: asset.body.data.id});
        }

        return { status: 500, body: { message: 'Internal server error' } };
    }
}

export async function updateProfileBio(user_id, bio) {
    try {
        validateType(user_id, 'number', 'User ID');
        validateType(bio, 'string', 'Bio');
    } catch (err) {
        return { status: 400, body: { message: err.message } };
    }

    if (bio === undefined || bio === null || bio === '') {
        return { status: 400, body: { message: 'Bio is required' } };
    }

    try {
        const updatedProfile = await updateProfileBioByUserIdQuery(user_id, bio);
        return { status: 200, body: { message: 'Profile bio updated successfully', data: updatedProfile } };
    } catch (err) {
        return { status: 500, body: { message: 'Internal server error' } };
    }
}

export async function updateProfilePronouns(user_id, pronouns) {
    try {
        validateType(user_id, 'number', 'User ID');
        validateType(pronouns, 'string', 'Pronouns');
    } catch (err) {
        return { status: 400, body: { message: err.message } };
    }

    if (pronouns === undefined || pronouns === null || pronouns === '') {
        return { status: 400, body: { message: 'Pronouns are required' } };
    }

    try {
        const updatedProfile = await updateProfilePronounsByUserIdQuery(user_id, pronouns);
        return { status: 200, body: { message: 'Profile pronouns updated successfully', data: updatedProfile } };
    } catch (err) {
        return { status: 500, body: { message: 'Internal server error' } };
    }
    
}

export async function updateDisplayName(user_id, display_name) {
    try {
        validateType(user_id, 'number', 'User ID');
        validateType(display_name, 'string', 'Display Name');
    } catch (err) {
        return { status: 400, body: { message: err.message } };
    }

    if (display_name === undefined || display_name === null || display_name === '') {
        return { status: 400, body: { message: 'Display name is required' } };
    }

    try {
        const updatedProfile = await updateDisplayNameByUserIdQuery(user_id, display_name);
        return { status: 200, body: { message: 'Profile display name updated successfully', data: updatedProfile } };
    } catch (err) {
        return { status: 500, body: { message: 'Internal server error' } };
    }
}

/**
 * Gets the profile of the requesting user
 *
 * @param {number} user_id the ID of the user
 * @returns {Promise<Object>} the response object with the status and body
 */
export async function getSelfProfile(user_id) {
    try {
        validateType(user_id, 'number', 'User ID');
    } catch (err) {
        return { status: 400, body: { message: err.message } };
    }

    try {
        const profile = await getProfileByUserIdQuery(user_id);
        return { status: 200, body: { message: 'Profile retrieved successfully', data: profile } };
    } catch (err) {
        if (err.message === 'Profile not found') {
            return { status: 404, body: { message: 'Profile not found' } };
        }
        return { status: 500, body: { message: 'Internal server error' } };
    }
}

/**
 * Gets a profile by its id
 * 
 * @param {number} id the ID of the profile
 * @returns 
 */
export async function getProfileById(id, { user_id = -1 } = {}) {
    try {
        validateType(id, 'number', 'ID');
    } catch (err) {
        return { status: 400, body: { message: err.message } };
    }

    try {
        const profile = await getProfileByIdQuery(id, { user_id });
        return { status: 200, body: { message: 'Profile retrieved successfully', data: profile } };
    } catch (err) {
        if (err.message === 'Profile not found') {
            return { status: 404, body: { message: 'Profile not found' } };
        }
        return { status: 500, body: { message: 'Internal server error' } };
    }
}