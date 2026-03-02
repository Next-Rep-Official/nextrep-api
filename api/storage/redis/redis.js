// First created Week 5 by Zane Beidas
// --------

import { createClient } from 'redis';
import config from '../../config.js';

const client = createClient({ url: config.redis.url });

client.on('error', (err) => console.error('Redis error:', err));
client.on('connect', () => console.log('Redis connected'));

const redisClient = client;
await redisClient.connect();

const redisSubscribe = redisClient.duplicate();
await redisSubscribe.connect();

export default redisClient;
export { redisSubscribe };