// First created Week 2 by Zane Beidas
// --------

import { Router } from 'express';
import { requireAuth } from '../../../util/middleware.js';
import { replyToReply, getRepliesFromReply } from './replies.service.js';

const router = Router();

router.post('/:reply_id/reply', requireAuth, async (req, res) => {
    const reply_id = Number(req.params.reply_id);
    const { body } = req.body;

    if (!body) return res.status(400).json({ message: 'Body is required' });

    try {
        const response = await replyToReply({ user_id: req.user.id, reply_id, body });
        res.status(response.status).json(response.body);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/:reply_id/reply', async (req, res) => {
    const reply_id = Number(req.params.reply_id);

    try {
        const response = await getRepliesFromReply({ reply_id });

        res.status(response.status).json(response.body);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
