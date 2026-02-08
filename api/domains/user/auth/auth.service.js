// First created Week 1 by Zane Beidas
// --------

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { createNewUser, getUserFromKey, getUserById } from './auth.queries.js';

import config from '../../../config.js';

import { validateType } from '../../../util/validation.js';
import { ValidationError, ForbiddenError } from '../../../util/errors.js';
import { CustomResponse } from '../../../util/response.js';

// ======== SIGNUP ======== //

/**
 * Endpoint to create a new account
 *
 * @param {string} username The username of the new user
 * @param {string} email The email of the new user
 * @param {string} password The raw password of the new user
 *
 * @returns {Promise<Object>} A jwt token for this user
 */
export async function signup(username, email, password) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    try {
        // Type checks
        validateType(email, 'string', 'Email');
        validateType(username, 'string', 'Username');
        validateType(password, 'string', 'Password');
        
        // Email format check
        if (!emailRegex.test(email)) {
            throw new ValidationError('Invalid email format');
        }

        // Password length check
        if (password.length < 8) {
            throw new ValidationError('Password must be at least 8 characters');
        }

        // Password uppercase check
        if (password.toLowerCase() === password) {
            throw new ValidationError('Password must include at least one uppercase charcter');
        }

        const hashed_password = await bcrypt.hash(password, 12);
        const user = await createNewUser(username, email, hashed_password);

        // Generate a token wiht an id, username, and account type
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                account_type: user.account_type,
            },
            config.jwt.secret,
            { expiresIn: '8h' }
        );

        return new CustomResponse(200, 'Successfully created new account! Welcome ' + user.username + '!', { token }).get();
    } catch (err) {
        if (err.code == 23505) {
            return new CustomResponse(409, 'Username or email already in use').get();
        }

        if (err.code < 0) {
            return new CustomResponse(err.status, err.message).get();
        }

        return new CustomResponse(500, 'Internal server error').get();
    }
}


// ======== LOGIN ======== //

/**
 * Endpoint to login to an existing account
 *
 * @param {string} key The key (either username or email)
 * @param {string} password Raw attempted password
 * 
 * @returns {Promise<Object>} A jwt token for this user
 */
export async function login(key, password) {
    try {
        // Type checks
        validateType(key, 'string', 'Key');
        validateType(password, 'string', 'Password');

        const user = await getUserFromKey(key.toLowerCase());

        const passwordValid = await bcrypt.compare(password, user.hashed_password);
        if (!passwordValid) {
            return new CustomResponse(400, 'Incorrect username/email or password').get();
        }

        // Create a token that can be used to sign in
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                account_type: user.account_type,
            },
            config.jwt.secret,
            { expiresIn: '8h' }
        );

        return new CustomResponse(200, 'Successfully logged in! Welcome ' + user.username + '!', { token }).get();
    } catch (err) {
        if (err.code < 0) {
            return new CustomResponse(err.status, err.message).get();
        }
        return new CustomResponse(500, 'Internal server error').get();
    }
}


// ======== GET USER ======== //

/**
 * Endpoint to get a user by their id
 *
 * @param {number} id The id of the user to get
 * @param {number} user_id The id of the user to get the user for
 *
 * @returns {Promise<Object>} A user object
 */
export async function getUser(id, { user_id = -1 } = {}) {
    try {
        validateType(id, 'number', 'ID');

        const user = await getUserById(id, { user_id });

        if (user.visibility === 'private' && user.id !== user_id) {
            throw new ForbiddenError('You are not the owner of this user');
        }

        return new CustomResponse(200, 'User retrieved successfully!', { user }).get();
    } catch (err) {
        if (err.code < 0) {
            return new CustomResponse(err.status, err.message).get();
        }

        return new CustomResponse(500, 'Internal server error').get();
    }
}
