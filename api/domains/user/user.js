// First created Week 1 by Zane Beidas
// --------

import { Router } from 'express';

import authRouter from './auth/auth.routes.js';
import profileRouter from './profile/profile.routes.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/profile', profileRouter);

export default router;
