// First created Week 5 by Zane Beidas
// --------

import { redisSubscribe } from '../storage/redis/redis.js';
import { joinChannel, leaveChannel, broadcastToChannel, removeClientFromAllChannels } from './repliesChannels.js';

/**
 * Attach WebSocket connection and Redis handlers to the given WebSocket server.
 * The server is created in app.js and attached to the HTTP server (same port, path: /ws).
 */
export function initWebSocket(wss) {
    wss.on('connection', ws => {
        ws.on('message', async message => {
            try {
                const data = JSON.parse(message);
                if (!data.type) return;
                if (!data.post_id && !data.reply_id) return;

                switch (data.type) {
                    case 'post':
                        await joinChannel(`post_${data.post_id}`, ws, { token: data.token });
                        break;
                    case 'reply':
                        await joinChannel(`reply_${data.reply_id}`, ws, { token: data.token });
                        break;
                    case 'leave_post':
                        leaveChannel(`post_${data.post_id}`, ws);
                        break;
                    case 'leave_reply':
                        leaveChannel(`reply_${data.reply_id}`, ws);
                        break;
                }
            } catch (err) {
                console.log('❌ Error parsing message:', err.message);
            }
        });

        ws.on('close', () => {
            removeClientFromAllChannels(ws);
        });
    });

    redisSubscribe.subscribe('post_replies', (message) => {
        try {
            const data = JSON.parse(message);
            if (!data.type) return;
            if (!data.reply) return;

            if (data.type == 'post_reply') {
                broadcastToChannel(`post_${data.post_id}`, data.reply);
            } else if (data.type == 'reply_reply') {
                broadcastToChannel(`reply_${data.reply_id}`, data.reply);
            } else if (data.type == 'reply_deleted') {
                broadcastToChannel(`deleted-reply_${data.reply_id}`, data.reply);
            }
        } catch (err) {
            console.log('❌ Error parsing message:', err.message);
        }
    });

    console.log('✅ WebSocket server attached at path /ws');
}
