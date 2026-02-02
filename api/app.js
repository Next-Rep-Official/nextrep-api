// First created Week 1 by Zane Beidas
// --------

import express from 'express';
import cors from 'cors';

import user from './domains/user/user.js';
import feed from './domains/feed/feed.js';
import assets from './domains/misc/assets/assets.routes.js';

import { initTables } from './database/helpers/tables.js';

// -------- CREATE APP -------- //
const app = express();

// -------- ON INIT -------- //

// Initilize server
app.use(express.json());
app.use(cors());

// Add Tables
await initTables().then(() => console.log('Tables initialized successfully ✅'));

// Add Routers
app.use('/user', user);
app.use('/feed', feed);
app.use('/assets', assets);

// -------- START SERVER -------- //
app.listen(3000, () => {
    console.log(`Server is running on http://localhost:${3000}`);
});
