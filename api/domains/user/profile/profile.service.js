// First created Week 2 by Zane Beidas
// --------

import { getProfileByUserIdQuery, getProfileByIdQuery, updateProfilePictureByUserIdQuery, updateProfileBioByUserIdQuery, updateProfilePronounsByUserIdQuery, updateDisplayNameByUserIdQuery } from './profile.queries.js';
import { validateType } from '../../../util/validation.js';
import { addAsset, removeAsset } from '../../misc/assets/assets.service.js';
import { CustomResponse } from '../../../util/response.js';
import { ValidationError, DatabaseError } from '../../../util/errors.js';

// ======== GET PROFILES ======== //

/**
 * Gets the profile of the requesting user
 *
 * @param {number} user_id the ID of the user
 * 
 * @returns {Promise<Object>} the response object with the status and body
 */
export async function getSelfProfile(user_id) {
    try {
        validateType(user_id, 'number', 'User ID');

        const profile = await getProfileByUserIdQuery(user_id);
        return new CustomResponse(200, 'Profile retrieved successfully', { profile }).get();
    } catch (err) {
        if (err.code < 0) {
            return new CustomResponse(err.status, err.message).get();
        }
        return new CustomResponse(500, 'Internal server error').get();
    }
}

/**
 * Gets a profile by its id
 * 
 * @param {number} id The ID of the profile
 * 
 * @param {Object} options The options for the service (user_id)
 * 
 * @returns {Promise<Object>} The response object with the status and body
 */
export async function getProfileById(id, { user_id = -1 } = {}) {
    try {
        // Type checks
        validateType(id, 'number', 'ID');

        const profile = await getProfileByIdQuery(id, { user_id: user_id ?? -1 });

        return new CustomResponse(200, 'Profile retrieved successfully', { profile }).get();
    } catch (err) {
        if (err.code < 0) {
            return new CustomResponse(err.status, err.message).get();
        }

        return new CustomResponse(500, 'Internal server error').get();
    }
}


// ======== UPDATE PROFILES ======== //

/**
 * Updates a user's profile picture
 * 
 * @param {number} user_id the ID of the user
 * @param {File} profile_picture 
 *  
 * @returns {Promise<Object>} the updated profile
 */
export async function updateProfilePicture(user_id, profile_picture) {
    let asset = null;

    try {
        // Type checks
        validateType(user_id, 'number', 'User ID');

        const profile = await getProfileByUserIdQuery(user_id);

        if (profile_picture.buffer === undefined || profile_picture.mimetype === undefined) {
            throw new ValidationError('Profile picture must be a file');
        }


        // Add asset to the database and bucket
        asset = await addAsset(profile_picture, user_id, 'user', 'profile_picture');

        // If the asset was not added successfully, throw an error
        if (asset.status !== 200) {
            throw new DatabaseError('Failed to add asset', { status: asset.status, code: -1 });
        }

        const assetId = asset.body.data.asset.id;

        // Update the profile picture of the user
        const updatedProfile = await updateProfilePictureByUserIdQuery(user_id, assetId);

        if (profile.profile_picture != null) {
            const response = await removeAsset(profile.profile_picture);
            if (response.status !== 200) {
                console.error("Failed to remove old asset ❌");
                throw new DatabaseError('Failed to remove old asset', { status: response.status, code: -1 });
            }
        }

        return new CustomResponse(200, 'Profile picture updated successfully', { profile: updatedProfile }).get();
    } catch (err) {
        const assetId = asset?.body?.data?.asset?.id;
        if (assetId != null) {
            await removeAsset(assetId);
        }

        if (err.code < 0) {
            return new CustomResponse(err.status, err.message).get();
        }

        return new CustomResponse(500, 'Internal server error').get();
    }
}

/**
 * Updates a user's profile bio
 * 
 * @param {number} user_id the ID of the user
 * @param {string} bio the bio of the user
 * 
 * @returns {Promise<Object>} the updated profile
 */
export async function updateProfileBio(user_id, bio) {
    try {
        // Type checks
        validateType(user_id, 'number', 'User ID');
        validateType(bio, 'string', 'Bio');

        if (bio === undefined || bio === null || bio === '') {
            throw new ValidationError('Bio is required');
        }

        const updatedProfile = await updateProfileBioByUserIdQuery(user_id, bio);
        return new CustomResponse(200, 'Profile bio updated successfully', { profile: updatedProfile }).get();
    } catch (err) {
        if (err.code < 0) {
            return new CustomResponse(err.status, err.message).get();
        }

        return new CustomResponse(500, 'Internal server error').get();
    }
}

/**
 * Updates a user's profile pronouns
 * 
 * @param {number} user_id the ID of the user
 * @param {string} pronouns the pronouns of the user
 * 
 * @returns {Promise<Object>} the updated profile
 */
export async function updateProfilePronouns(user_id, pronouns) {
    try {
        // Type checks
        validateType(user_id, 'number', 'User ID');
        validateType(pronouns, 'string', 'Pronouns');

        if (pronouns === undefined || pronouns === null || pronouns === '') {
            throw new ValidationError('Pronouns are required');
        }

        const updatedProfile = await updateProfilePronounsByUserIdQuery(user_id, pronouns);
        return new CustomResponse(200, 'Profile pronouns updated successfully', { profile: updatedProfile }).get();
    } catch (err) {
        if (err.code < 0) {
            return new CustomResponse(err.status, err.message).get();
        }

        return new CustomResponse(500, 'Internal server error').get();
    } 
}

/**
 * Updates a user's display name
 * 
 * @param {number} user_id the ID of the user
 * @param {string} display_name the display name of the user
 * 
 * @returns {Promise<Object>} the updated profile
 */
export async function updateDisplayName(user_id, display_name) {
    try {
        validateType(user_id, 'number', 'User ID');
        validateType(display_name, 'string', 'Display Name');

        if (display_name === undefined || display_name === null || display_name === '') {
            throw new ValidationError('Display name is required');
        }

        const updatedProfile = await updateDisplayNameByUserIdQuery(user_id, display_name);
        return new CustomResponse(200, 'Profile display name updated successfully', { profile: updatedProfile }).get();
    } catch (err) {
        if (err.code < 0) {
            return new CustomResponse(err.status, err.message).get();
        }

        return new CustomResponse(500, 'Internal server error').get();
    }
}