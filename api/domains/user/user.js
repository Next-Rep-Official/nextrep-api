// First created Week 1 by Zane Beidas
// --------

import express from 'express';
import { Router } from 'express';
import authRouter from './auth/auth.routes.js';

const router = Router();

router.use('/auth', authRouter);

export default router;
