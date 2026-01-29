// First created Week 1 by Zane Beidas
// --------

import express from 'express';

import postRouter from "./posts/posts.routes.js"

const router = express();

router.use("/posts", postRouter)

export default router;
