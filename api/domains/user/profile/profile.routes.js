// First created Week 2 by Zane Beidas
// --------

import { Router } from 'express';
import { requireAuth, acceptAuth } from '../../../util/middleware.js';
import { updateProfilePicture, updateProfileBio, updateProfilePronouns, updateDisplayName, getSelfProfile, getProfileById } from './profile.service.js';

import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();


// ======== UPDATE PROFILES ======== //

router.put("/picture", requireAuth, upload.single('profile_picture'), async (req, res) => {
    try {
        const { id } = req.user;
        const profile_picture = req.file;

        if (!profile_picture) {
            return res.status(400).json({ message: 'Profile picture is required' });
        }

        const response = await updateProfilePicture(id, profile_picture);
        res.status(response.status).json(response.body);
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.put("/bio", requireAuth, async (req, res) => {
    try {
        const { id } = req.user;
        const { bio } = req.body;

        const response = await updateProfileBio(id, bio);
        res.status(response.status).json(response.body);
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.put("/pronouns", requireAuth, async (req, res) => {
    try {
        const { id } = req.user;
        const { pronouns } = req.body;

        const response = await updateProfilePronouns(id, pronouns);
        res.status(response.status).json(response.body);
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.put("/display-name", requireAuth, async (req, res) => {
    try {
        const { id } = req.user;
        const { display_name } = req.body;

        const response = await updateDisplayName(id, display_name);
        res.status(response.status).json(response.body);
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
})


// ======== GET PROFILES ======== //

router.get('/self', requireAuth, async (req, res) => {
    try {
        const { id } = req.user;
        const response = await getSelfProfile(Number(id));
        res.status(response.status).json(response.body);
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/:id', acceptAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user?.id ?? -1;

        const response = await getProfileById(Number(id), { user_id });
        res.status(response.status).json(response.body);
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
