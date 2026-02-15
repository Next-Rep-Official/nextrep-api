// First created Week 1 by Zane Beidas
// --------

import { Router } from 'express';

import { signup, login, getUser, searchUsers, deleteUser, updateUserVisibility } from './auth.service.js';
import { acceptAuth, requireAuth } from '../../../util/middleware.js';
const router = Router();

// ======== SIGNUP ======== //

router.post('/sign-up', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const response = await signup(username, email, password);
        return res.status(response.status).json(response.body);
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});


// ======== LOGIN ======== //

router.post('/login', async (req, res) => {
    try {
        const { key, password } = req.body;
        const response = await login(key, password);

        return res.status(response.status).json(response.body);
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});


// ======== GET USERS ======== //

router.get('/search/:query', acceptAuth, async (req, res) => {
    try {
        const response = await searchUsers(req.params.query, { user_id: req.user?.id ?? -1 });
        return res.status(response.status).json(response.body);
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error'});
    }
});


router.get('/:id', acceptAuth, async (req, res) => {
    try {
        const response = await getUser(Number(req.params.id), { user_id: req.user?.id ?? -1 });
        return res.status(response.status).json(response.body);
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// ======== UPDATE USER ======== //

router.put('/visibility', requireAuth, async (req, res) => {
    try {
        const { visibility } = req.body;
        const response = await updateUserVisibility(req.user.id, visibility);
        return res.status(response.status).json(response.body);
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});


// ======== DELETE USER ======== //

router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const response = await deleteUser(req.user.id);
        return res.status(response.status).json(response.body);
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
