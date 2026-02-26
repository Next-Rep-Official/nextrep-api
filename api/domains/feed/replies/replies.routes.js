// First created Week 2 by Zane Beidas
// --------

import { Router } from 'express';
import { requireAuth, acceptAuth } from '../../../util/middleware.js';
import { replyToReply, getRepliesFromReply, deleteReply } from './replies.service.js';

const router = Router();


// ======== CREATE REPLIES ========

router.post('/:reply_id/reply', requireAuth, async (req, res) => {
    const reply_id = Number(req.params.reply_id);
    const { body } = req.body;

    if (!body) return res.status(400).json({ message: 'Body is required' });

    try {
        const response = await replyToReply(req.user.id, reply_id, body);
        res.status(response.status).json(response.body);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/:reply_id/like', requireAuth, async (req, res) => {
    const reply_id = Number(req.params.reply_id);
    const user_id = req.user.id;

    try {
        const response = await likeReply(user_id, reply_id);
        res.status(response.status).json(response.body);
    } catch (err) {
        if (err.code < 0) {
            return res.status(err.status).json({ message: err.message });
        }

        return res.status(500).json({ message: 'Internal server error' });
    }
});


// ======== GET REPLIES ========

router.get('/:reply_id/reply', acceptAuth, async (req, res) => {
    const reply_id = Number(req.params.reply_id);
    const user_id = req.user?.id ?? -1;

    try {
        const response = await getRepliesFromReply(reply_id, { user_id });
        res.status(response.status).json(response.body);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
});


// ======== DELETE REPLIES ========

router.delete('/:reply_id', requireAuth, async (req, res) => {
    const reply_id = Number(req.params.reply_id);
    const user_id = req.user.id;

    try {
        const response = await deleteReply(user_id, reply_id);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
})

export default router;
