// First created Week 1 by Zane Beidas
// --------

import express from 'express';
import cors from 'cors';

import user from './domains/user/user.js';
import feed from './domains/feed/feed.js';
import assets from './domains/misc/assets/assets.routes.js';

import rateLimit from 'express-rate-limit';

import { initTables } from './database/helpers/tables.js';
import config from './config.js';


// ======== CREATE APP ======== //

const app = express();


// ======== ON INIT ======== //

Object.values(config).forEach((value) => {
    Object.entries(value).forEach(([key, value]) => {
        if (value == null || value == '') {
            throw new Error(`${value.key}.${key} is not set in the config`);
        }
    });
});

// Initilize server
app.use(express.json());
app.use(cors());

// Handle rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `windowMs`
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// Add Tables
await initTables().then(() => console.log('Tables initialized successfully ✅'));

// Add Routers
app.use('/user', user);
app.use('/feed', feed);
app.use('/assets', assets);


// ======== START SERVER ======== //

app.listen(3000, () => {
    console.log(`Server is running on http://localhost:${3000}`);
});
