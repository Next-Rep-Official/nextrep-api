// First created week 3 by Zane Beidas
// -------

import { Router } from 'express';
import { requireAuth, acceptAuth } from '../../../util/middleware.js';
import { followUser, unfollowUser, getFollowers, getFollowing, getFollowersCount, getFollowingCount } from './follow.service.js';

const router = Router();


// ======== FOLLOW / UNFOLLOW USERS ======== //

router.post('/follow/:id', requireAuth, async (req, res) => {
    try {
        const id = req.user.id;
        const followed_id = req.params.id;

        const response = await followUser(id, Number(followed_id));

        res.status(response.status).json(response.body);
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/unfollow/:id', requireAuth, async (req, res) => {    try {
        const id = req.user.id;
        const followed_id = req.params.id;

        const response = await unfollowUser(id, Number(followed_id));
        
        res.status(response.status).json(response.body);
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});


// ======== GET FOLLOWERS / FOLLOWING ======== //

router.get('/followers/:id', acceptAuth, async (req, res) => {
    try {
        const id = req.params.id;
        const user_id = req.user?.id ?? -1;

        const response = await getFollowers(Number(id), { user_id });
        
        res.status(response.status).json(response.body);
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/following/:id', acceptAuth, async (req, res) => {
    try {
        const id = req.params.id;
        const user_id = req.user?.id ?? -1;

        const response = await getFollowing(Number(id), { user_id });
        
        res.status(response.status).json(response.body);
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});


// ======== GET NUMBER OF FOLLOWERS / FOLLOWING ======== //

router.get('/followers/count/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const response = await getFollowersCount(Number(id));
        
        res.status(response.status).json(response.body);
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/following/count/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const response = await getFollowingCount(Number(id));
        
        res.status(response.status).json(response.body);
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;