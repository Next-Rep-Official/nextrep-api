// First created Week 5 by Zane Beidas
// --------

const channels = new Map(); 

function getOrCreateChannel(name) {
    if (!channels.has(name)) {
        channels.set(name, new Set());
    }
    return channels.get(name);
}

function joinChannel(channelName, ws) {
    const channel = getOrCreateChannel(channelName);
    channel.add(ws);
    return channel;
}

function leaveChannel(channelName, ws) {
    const channel = channels.get(channelName);
    if (channel) {
        channel.delete(ws);
        if (channel.size === 0) {
            channels.delete(channelName);
        }
    }
}

function broadcastToChannel(channelName, data, { excludeWs = null } = {}) {
    const channel = channels.get(channelName);
    if (!channel) return;
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    for (const ws of channel) {
        if (ws.readyState === 1 && ws !== excludeWs) {
            ws.send(payload);
        }
    }
}

function removeClientFromAllChannels(ws) {
    for (const [name, channel] of channels) {
        channel.delete(ws);
        if (channel.size === 0) channels.delete(name);
    }
}

export {
    getOrCreateChannel,
    joinChannel,
    leaveChannel,
    broadcastToChannel,
    removeClientFromAllChannels,
};