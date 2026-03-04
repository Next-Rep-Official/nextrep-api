// First created Week 5 by Zane Beidas
// --------

import pool from '../storage/database/db.js';
import jwt from 'jsonwebtoken';
import config from '../../config.js';

const channels = new Map(); 

async function getOrCreateChannel(id, type) {
    if (!channels.has(`${type}_${id}`)) {
        let data = null;
        if (type == 'post') {
            const post = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);
            if (post.rows.length === 0) return null;
            data = post.rows[0];
        } else if (type == 'reply') {
            const reply = await pool.query('SELECT r.*, p.visibility, p.author_id FROM replies r JOIN posts p ON p.id = r.post_id WHERE r.id = $1', [id]);
            if (reply.rows.length === 0) return null;
            data = reply.rows[0];
        }
        if (!data) return null;
        const channel = {
            id,
            type,
            data,
            clients: new Set()
        };
        channels.set(`${type}_${id}`, channel);
    }

    return channels.get(`${type}_${id}`);
}

async function joinChannel(channelName, ws, { token = null } = {}) {
    const split = channelName.split('_');
    const id = split[1];
    const type = split[0];

    const channel = await getOrCreateChannel(id, type);
    if (!channel) return null;
    
    let decoded = {id: -1};

    try {
        decoded = jwt.verify(token, config.jwt.secret, { algorithms: ['HS256'] });
    } catch {}

    if (!decoded) decoded = {id: -1};

    if (channel.data.visibility == 'private' && channel.data.author_id != decoded.id) {
        if (channels.get(channelName).clients.size === 0) {
            channels.delete(channelName);
        }

        return null;
    };

    channel.clients.add(ws);
    return channel;
}

function leaveChannel(channelName, ws) {
    const channel = channels.get(channelName);
    if (channel) {
        channel.clients.delete(ws);
        if (channel.clients.size === 0) {
            channels.delete(channelName);
        }
    }
}

function broadcastToChannel(channelName, data, { excludeWs = null } = {}) {
    const channel = channels.get(channelName);
    if (!channel) return;
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    for (const ws of channel.clients) {
        if (ws.readyState === 1 && ws !== excludeWs) {
            ws.send(payload);
        }
    }
}

function removeClientFromAllChannels(ws) {
    for (const [name, channel] of channels) {
        channel.clients.delete(ws);
        if (channel.clients.size === 0) channels.delete(name);
    }
}

export {
    getOrCreateChannel,
    joinChannel,
    leaveChannel,
    broadcastToChannel,
    removeClientFromAllChannels,
};