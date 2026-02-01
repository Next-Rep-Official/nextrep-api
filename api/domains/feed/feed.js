// First created Week 1 by Zane Beidas
// --------

import express, { Router } from 'express';

import postRouter from './posts/posts.routes.js';
import replyRouter from './replies/replies.routes.js'

const router = Router();

router.use('/posts', postRouter);
router.use('/replies', replyRouter);

export default router;
 