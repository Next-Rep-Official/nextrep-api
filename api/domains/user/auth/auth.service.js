// First created Week 1 by Zane Beidas
// --------

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { createNewUser, getUserFromKey } from "./auth.repo.js";

/** 
 * Endpoint to create a new account 
 * 
 * @param {string} username The username of the new user 
 * @param {string} email The email of the new user 
 * @param {string} password The raw password of the new user 
 * 
 * @returns {json} A jwt token for this user 
 */
export async function signup({ username, email, password }) {
    // Handle possible internal errors
    if (!process.env.JWT_SECRET) {
        return {
            status: 500,
            body: { message: "Internal server error" }
        };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Email checks
    if (typeof email != "string") {
        return { status: 400, body: { message: "Email must be a string value" } };
    } else if (!emailRegex.test(email)) {
        return { status: 400, body: { message: "Invalid email format" } };
    }

    // Username checks
    if (typeof username != "string") {
        return { status: 400, body: { message: "Username must be a string value" } };
    }

    // Password checks
    if (typeof password != "string") {
        return { status: 400, body: { message: "Password must be a string value" } };
    } else if (password.length < 8) {
        return { status: 400, body: { message: "Password must be at least 8 characters" } };
    } else if (password.toLowerCase() === password) {
        return { status: 400, body: { message: "Password must include at least one uppercase charcter" } };
    }

    try {
        // Hash password
        const hashed_password = await bcrypt.hash(password, 12);

        // Create a user and get the data
        const user = await createNewUser(username, email, hashed_password);

        // Create a token that can be used to sign in
        const token = jwt.sign(
            { id: user.id, username: user.username, display_name: user.display_name, account_type: user.account_type },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        return {
            status: 200,
            body: {
                message: "Successfully created new account! Welcome " + user.display_name + "!",
                data: { token }
            }
        };
    } catch (err) {
        if (err.code == 23505) {
            return { status: 409, body: { message: "Username or email already in use" } };
        }

        return { status: 500, body: { message: "Internal server error" } };
    }
}

/** 
 * Endpoint to login to an existing account 
 *
 * @param {string} key The key (either username or email) 
 * @param {string} password Raw attempted password 
 */
export async function login({ key, password }) {
    // Handle possible internal errors
    if (!process.env.JWT_SECRET) {
        return { status: 500, body: { message: "Internal server error" } };
    }

    // Check key
    if (typeof key != "string") {
        return { status: 400, body: { message: "Key must be a string value" } };
    }

    // Check password
    if (typeof password != "string") {
        return { status: 400, body: { message: "Password must be a string value" } };
    }

    try {
        // Get the user
        const user = await getUserFromKey(key.toLowerCase());

        // Check the password
        const passwordValid = await bcrypt.compare(password, user.hashed_password);
        if (!passwordValid) {
            return { status: 400, body: { message: "Incorrect username/email or password" } };
        }

        // Create a token that can be used to sign in
        const token = jwt.sign(
            { id: user.id, username: user.username, display_name: user.display_name, account_type: user.account_type },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        return {
            status: 200,
            body: {
                message: "Successfully logged in! Welcome " + user.display_name + "!",
                data: { token }
            }
        };
    } catch (err) {
        if (err.code === 1) {
            return { status: 400, body: { message: "No users match given key" } };
        }
        return { status: 500, body: { message: "Internal server error" } };
    }
}
