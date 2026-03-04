// First created Week 5 by Zane Beidas
// --------

import { WebSocketServer } from 'ws';
import { redisSubscribe } from '../storage/redis/redis.js';
import { joinChannel, leaveChannel, broadcastToChannel, removeClientFromAllChannels } from './repliesChannels.js';
import config from '../../config.js';
import jwt from 'jsonwebtoken';

const server = new WebSocketServer({ port: 8080 });

server.on('connection', ws => {
    console.log('Client connected');
  
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

server.on('listening', () => {
    console.log('✅ WebSocket server is running on port 8080');
});