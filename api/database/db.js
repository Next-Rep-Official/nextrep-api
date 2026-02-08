// First created Week 1 by Zane Beidas
// --------

import pkg from 'pg';

// Environemt variables
import config from '../config.js';

const { Pool } = pkg;

const pool = new Pool({
    connectionString: config.database.url,
    ssl: { rejectUnauthorized: false },
});

export default pool;
