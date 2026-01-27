import express from "express"

import authRouter from "./auth/auth.service.js"

const router = express();

router.use("/auth", authRouter);

export default router;
