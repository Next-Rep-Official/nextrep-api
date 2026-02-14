// First created Week 3 by Zane Beidas
// --------

import pool from './db.js';
import { removeAsset } from '../domains/misc/assets/assets.service.js';

const client = await pool.connect();

client.on('notification', async (msg) => {
    if (msg.channel === 'profile_removed') {
        try {
            const payload = JSON.parse(msg.payload);
            const response = await removeAsset(Number(payload.profile_picture));

            if (response.status !== 200) {
                console.error('Error removing asset:', response.body);
            }
        } catch (err) {
            console.error('Error removing asset:', err);
        }
    } else if (msg.channel === 'post_attachment_removed') {
        try {
            const payload = JSON.parse(msg.payload);
            const response = await removeAsset(Number(payload.asset_id));

            if (response.status !== 200) {
                console.error('Error removing asset:', response.body);
            }
        } catch (err) {
            console.error('Error removing asset:', err);
        }
    }
});

await client.query('LISTEN profile_removed');
await client.query('LISTEN post_attachment_removed');

