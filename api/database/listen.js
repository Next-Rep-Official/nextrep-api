// First created Week 3 by Zane Beidas
// --------

import pool from './db.js';
import { removeAsset } from '../domains/misc/assets/assets.service.js';

const client = await pool.connect();
console.log('Connected to database ✅');

client.on('notification', async (msg) => {
    console.log('Notification received ✅');

    if (msg.channel === 'profile_removed') {
        try {
            const payload = JSON.parse(msg.payload);
            const assetId = payload.profile_picture != null ? Number(payload.profile_picture) : null;
            if (assetId == null) return console.log('No profile picture to remove ❌'); // no picture was set
            const response = await removeAsset(assetId);

            if (response.status !== 200) {
                console.error('Error removing asset:', response.body);
            } else {
                console.log('Profile picture removed ✅');
            }
        } catch (err) {
            console.error('Error removing profile picture:', err);
        }
    } else if (msg.channel === 'post_attachment_removed') {
        try {
            const payload = JSON.parse(msg.payload);
            const assetId = payload.asset_id != null ? Number(payload.asset_id) : null;

            if (assetId == null) return console.log('No post attachment to remove ❌');

            const response = await removeAsset(assetId);

            if (response.status !== 200) {
                console.error('Error removing asset:', response.body);
            } else {
                console.log('Post attachment removed ✅');
            }
        } catch (err) {
            console.error('Error removing post attachment:', err);
        }
    }
});

await client.query('LISTEN profile_removed');
await client.query('LISTEN post_attachment_removed');

