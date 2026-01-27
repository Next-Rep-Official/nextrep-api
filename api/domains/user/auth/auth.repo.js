// First created Week 1 by Zane Beidas
// --------

import pool from "../../../db.js";

/**
 * Creates a new user with the inputted information
 */
export async function createNewUser(username, display_name = username, email, hashed_password) {
    const { rows } = await pool.query(
        "INSERT INTO users (username, display_name, email, hashed_password) VALUES($1, $2, $3, $4) RETURNING *",
        [username.toLocaleLowerCase(), display_name, email.toLocaleLowerCase(), hashed_password]
    )

    return rows[0]
}

/**
 * Get the user's info that is correlated with the key
 */
export async function getUserFromKey(key) {
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1 OR username = $1 LIMIT 1", [key])

    if (rows.length === 0)  {
        const error = new Error("User not found")
        error.code = 1;
        throw error;
    }

    return rows[0];
}
