// First created Week 1 by Zane Beidas
// --------

import { Router } from 'express';

import { signup, login, getUser } from './auth.service.js';
import { acceptAuth } from '../../../util/middleware.js';
const router = Router();

// ======== SIGNUP ======== //

router.post('/sign-up', async (req, res) => {
    try {
        const response = await signup(req.body);
        return res.status(response.status).json(response.body);
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});


// ======== LOGIN ======== //

router.post('/login', async (req, res) => {
    try {
        const response = await login(req.body);
        return res.status(response.status).json(response.body);
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});


// ======== GET USERS ======== //

router.get('/:id', acceptAuth, async (req, res) => {
    try {
        const response = await getUser(req.params.id, { user_id: req.user.id });
        return res.status(response.status).json(response.body);
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
