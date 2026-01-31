// First created Week 2 by Zane Beidas
// --------

import pool from '../../../database/db.js';

/**
 * Runs multiple queries inside a transaction
 * 
 * @param {function(client: import('pg').PoolClient): Promise<any>} callback 
 *        A function that takes a client and performs queries
 *
 * @returns {Promise<any>} The result of the callback
 */
export async function runTransaction(callback) {
    const client = await pool.connect(); // get a client from the pool
    try {
        await client.query('BEGIN'); // start transaction
        const result = await callback(client); // run user queries
        await client.query('COMMIT'); // commit if successful
        return result;
    } catch (err) {
        await client.query('ROLLBACK'); // rollback on error
        throw err;
    } finally {
        client.release(); // release the client back to the pool
    }
}
