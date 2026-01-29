import express from 'express';

import authRouter from './auth/auth.routes.js';

const router = express();

router.use('/auth', authRouter);

export default router;
