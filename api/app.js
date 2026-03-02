// First created Week 1 by Zane Beidas
// --------

import express from 'express';
import cors from 'cors';

import user from './domains/user/user.js';
import feed from './domains/feed/feed.js';
import assets from './domains/misc/assets/assets.routes.js';

import rateLimit from 'express-rate-limit';

import { initTables } from './storage/database/helpers/tables.js';
import config from './config.js';


import './websockets/server.js';

// ======== CREATE APP ======== //

const app = express();

// Trust the first proxy (e.g. Railway) so X-Forwarded-For is used for client IP and rate limiting works
app.set('trust proxy', 1);

// ======== ON INIT ======== //

Object.entries(config).forEach(([sectionKey, sectionValue]) => {
    Object.entries(sectionValue).forEach(([key2, value2]) => {
        if (value2 == null || value2 == '') {
            throw new Error(`${sectionKey}.${key2} is not set in the config`);
        }
    });
});

// Initilize server
app.use(express.json());
app.use(cors());

// // Handle rate limiting
// const limiter = rateLimit({
//     windowMs: 10 * 60 * 1000, // 15 minutes
//     max: 300, // Limit each IP to 100 requests per `windowMs`
//     standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
//     legacyHeaders: false, // Disable the `X-RateLimit-*` headers
// });
// app.use(limiter);

// Add Tables
await initTables().then((value) => console.log(value));

// Add Routers
app.use('/user', user);
app.use('/feed', feed);
app.use('/assets', assets);


// ======== START SERVER ======== //

app.listen(3000, () => {
    console.log(`Server is running on port ${3000}`);
});
