// First created Week 3 by Zane Beidas
// --------

import {  
    addFollowToUser,
    removeFollowFromUser,
    getFollowersFromUser,
    getFollowingFromUser,
    getNumberOfFollowers,
    getNumberOfFollowing
} from './follow.queries.js';

import { CustomResponse } from '../../../util/response.js';
import { ValidationError, NotFoundError, UniqueViolationError } from '../../../util/errors.js';
import { validateType } from '../../../util/validation.js';


// ======== FOLLOW / UNFOLLOW USERS ======== //

/**
 * Adds a follow to a user. Must be authenticated.
 * 
 * @param {number} user_id 
 * @param {number} followed_id 
 * 
 * @returns {Promise<Object>} The response object with the status and body
 */
export async function followUser(user_id, followed_id) {
    try {
        validateType(user_id, 'number', 'User ID');
        validateType(followed_id, 'number', 'Followed ID');

        const result = await addFollowToUser(user_id, followed_id);

        return new CustomResponse(200, 'User followed successfully', { result }).get();
    } catch (err) {
        if (err.code < 0) {
            return new CustomResponse(err.status, err.message).get();
        }

        return new CustomResponse(500, 'Internal server error').get();
    }
}

/**
 * Removes a follow from a user. Must be authenticated.
 * 
 * @param {number} user_id 
 * @param {number} followed_id 
 * 
 * @returns {Promise<Object>} The response object with the status and body
 */
export async function unfollowUser(user_id, followed_id) {
    try {
        validateType(user_id, 'number', 'User ID');
        validateType(followed_id, 'number', 'Followed ID');

        const result = await removeFollowFromUser(user_id, followed_id);

        return new CustomResponse(200, 'User unfollowed successfully', { result }).get();
    } catch (err) {
        if (err.code < 0) {
            return new CustomResponse(err.status, err.message).get();
        }

        return new CustomResponse(500, 'Internal server error').get();
    }
}


// ======== GET FOLLOWERS / FOLLOWING ======== //

/**
 * Gets the followers of a user
 * 
 * @param {number} id 
 * @param {Object} { user_id = -1 } The id of the user requesting the followers
 * 
 * @returns {Promise<Object>} The response object with the status and body
 */
export async function getFollowers(id, { user_id = -1 } = {}) {
    try {
        validateType(id, 'number', 'ID');

        const followers = await getFollowersFromUser(id, { user_id: user_id ?? -1 });

        return new CustomResponse(200, 'Followers retrieved successfully', { followers }).get();
    } catch (err) {
        if (err.code < 0) {
            return new CustomResponse(err.status, err.message).get();
        }

        return new CustomResponse(500, 'Internal server error').get();
    }
}

/**
 * Gets the following users of a user
 * 
 * @param {number} id 
 * @param {Object} { user_id = -1 } The id of the user requesting the following
 * 
 * @returns {Promise<Object>} The response object with the status and body
 */
export async function getFollowing(id, { user_id = -1 } = {}) {
    try {
        validateType(id, 'number', 'ID');

        const following = await getFollowingFromUser(id, { user_id: user_id ?? -1 });

        return new CustomResponse(200, 'Following retrieved successfully', { following }).get();
    } catch (err) {
        if (err.code < 0) {
            return new CustomResponse(err.status, err.message).get();
        }

        return new CustomResponse(500, 'Internal server error').get();
    }
}


// ======== GET NUMBER OF FOLLOWERS / FOLLOWING ======== //

/**
 * Gets the number of followers of a user
 * 
 * @param {number} user_id The user ID to get the number of followers for
 * 
 * @returns {Promise<Object>} The response object with the status and body
 */
export async function getFollowersCount(user_id) {
    try {
        validateType(user_id, 'number', 'User ID');

        const followersCount = await getNumberOfFollowers(user_id);

        return new CustomResponse(200, 'Followers count retrieved successfully', { followersCount }).get();
    } catch (err) {
        if (err.code < 0) {
            return new CustomResponse(err.status, err.message).get();
        }

        return new CustomResponse(500, 'Internal server error').get();
    }
}

/**
 * Gets the number of following users of a user
 * 
 * @param {number} user_id The user ID to get the number of following users for
 * 
 * @returns {Promise<Object>} The response object with the status and body
 */
export async function getFollowingCount(user_id) {
    try {
        validateType(user_id, 'number', 'User ID');

        const followingCount = await getNumberOfFollowing(user_id);

        return new CustomResponse(200, 'Following count retrieved successfully', { followingCount }).get();
    } catch (err) {
        if (err.code < 0) {
            return new CustomResponse(err.status, err.message).get();
        }

        return new CustomResponse(500, 'Internal server error').get();
    }
}