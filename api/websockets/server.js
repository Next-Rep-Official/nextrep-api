// First created Week 5 by Zane Beidas
// --------

import { WebSocketServer } from 'ws';
import { redisSubscribe } from '../storage/redis/redis.js';
import { joinChannel, leaveChannel, broadcastToChannel, removeClientFromAllChannels } from './channels.js';
import config from '../../config.js';

const server = new WebSocketServer({ port: 8080 });

server.on('connection', ws => {
    console.log('Client connected');
  
    ws.on('message', message => {
        const data = JSON.parse(message);
        switch (data.type) {
            case 'post':
                joinChannel(`post_${data.post_id}`, ws);
                break;
            case 'reply':
                joinChannel(`reply_${data.reply_id}`, ws);
                break;
        }
    });
  
    ws.on('close', () => {
        removeClientFromAllChannels(ws);
    });
});

redisSubscribe.subscribe('post_replies', (message) => {
    try {
        const data = JSON.parse(message);
        if (data.type == 'post_reply') {
            broadcastToChannel(`post_${data.post_id}`, data.reply);
        } else if (data.type == 'reply_reply') {
            broadcastToChannel(`reply_${data.reply_id}`, data.reply);
        }
    } catch (err) {
        console.error('❌ Error parsing message:', err.message);
    }
});
