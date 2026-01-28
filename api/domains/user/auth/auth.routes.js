// First created Week 1 by Zane Beidas
// --------

import { Router } from 'express';

import { signup, login } from './auth.service.js';

const router = Router();

router.post('/sign-up', async (req, res) => {
    try {
        const response = await signup(req.body);
        return res.status(response.status).json(response.body);
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const response = await login(req.body);
        return res.status(response.status).json(response.body);
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
