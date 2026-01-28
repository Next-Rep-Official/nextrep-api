import express from 'express';
import cors from 'cors';

import user from './domains/user/user.js';
import { initTables } from './util/database.js';

// -------- CREATE APP -------- //
const app = express();

// -------- ON INIT -------- //

// Initilize server
app.use(express.json());
app.use(cors());
// Add Tables
initTables()
    .then(() => console.log('Tables initialized successfully ✅'))
    .catch((err) => console.error('Tables init error:', err));
// Add Routers
app.use('/user', user);

// -------- START SERVER -------- //
app.listen(3000, () => {
    console.log(`Server is running on http://localhost:${3000}`);
});
