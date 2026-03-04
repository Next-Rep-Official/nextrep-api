// First created Week 3 by Zane Beidas
// --------

import pool from '../api/storage/database/db.js';
import { removeAsset } from '../api/domains/misc/assets/assets.service.js';


const removeAssetSequence = async (assetId) => {
    try {
        const response = await removeAsset(assetId);

        if (response.status !== 200) {
            console.log('❌ Error removing asset');
        } else {
            console.log('✅ Profile picture removed');
        }
    } catch (err) {
        console.log('❌ Error removing assets:', err.message);
    }
}

async function startListener() {
    const client = await pool.connect();
    console.log('✅ Connected to database');

    client.on('error', async (err) => {
        console.log('❌ Database connection error:', err.message);
        client.release(true);
    });

    client.on('notification', async (msg) => {
        console.log('✅ Notification received');
        try {
            if (msg.channel === 'profile_removed') {
                const payload = JSON.parse(msg.payload);
                const assetId = payload.profile_picture != null ? Number(payload.profile_picture) : null;
                if (assetId == null) return console.log('No profile picture to remove ❌');
                                                                                            
                await removeAssetSequence(assetId);
            } else if (msg.channel === 'post_attachment_removed') {
                const payload = JSON.parse(msg.payload);
                const assetId = payload.asset_id != null ? Number(payload.asset_id) : null;
                if (assetId == null) return console.log('No post attachment to remove ❌');

                await removeAssetSequence(assetId);
            }
        } catch (err) {
            console.log('❌ Error parsing message:', err.message);
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

startListener().catch((err) => {
    console.error('❌ Error starting listener:', err.message);
    
    setTimeout(startListener, 5000);
});
