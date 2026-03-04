// First created Week 3 by Zane Beidas
// --------

import pool from '../api/storage/database/db.js';
import { removeAsset } from '../api/domains/misc/assets/assets.service.js';


const removeAssetSequence = async (assetId) => {
    try {
        const response = await removeAsset(assetId);

        if (response.status !== 200) {
            console.error('❌ Error removing asset:', response.body.data.asset);
        } else {
            console.log('✅ Profile picture removed');
        }
    } catch (err) {
        console.error('❌ Error removing assets:', err.message);
    }
}

async function startListener() {
    const client = await pool.connect();
    console.log('✅ Connected to database');

    client.on('error', async (err) => {
        console.error('❌ Database connection error:', err.message);
        client.release(true);
        setTimeout(startListener, 5000);
    });

    client.on('notification', async (msg) => {
        console.log('✅ Notification received');

        if (msg.channel === 'profile_removed') {
            const payload = JSON.parse(msg.payload);
            const assetId = payload.profile_picture != null ? Number(payload.profile_picture) : null;
            if (assetId == null) return console.log('No profile picture to remove ❌');
                                                                                        
            await removeAssetSequence(assetId);
        } else if (msg.channel === 'post_attachment_removed') {
            const payload = JSON.parse(msg.payload);
            const assetId = payload.post_attachment != null ? Number(payload.post_attachment) : null;
            if (assetId == null) return console.log('No post attachment to remove ❌');

            await removeAssetSequence(assetId);
        }
    });

    await client.query('LISTEN profile_removed');
    await client.query('LISTEN post_attachment_removed');

    console.log('✅ Listening for notifications...');
}

// process.on('SIGTERM', async () => {
//     console.log('Shutting down listener...');
//     await pool.end();
//     process.exit(0);
// });

// process.on('SIGINT', async () => {
//     console.log('Shutting down listener...');
//     await pool.end();
//     process.exit(0);
// });

startListener();
