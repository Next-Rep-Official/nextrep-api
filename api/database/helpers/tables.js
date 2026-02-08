// First created Week 1 by Zane Beidas
// --------

import fs from 'fs/promises';
import path, { parse } from 'path';
import pool from '../db.js';

export async function parseFile(name) {
    try {
        const data = await fs.readFile(name);
        return data.toString();
    } catch (err) {
        return '';
    }
}

export async function initTables() {
    const folderPath = path.join(process.cwd(), 'api', 'database', 'tables');

    try {
        console.log(folderPath);
        const files = await fs.readdir(folderPath);

        for (const fileName of files) {
            const fullPath = path.join(folderPath, fileName);
            const data = await parseFile(fullPath);

            await pool.query(data);
        }

        return true;
    } catch (err) {
        return false;
    }
}
