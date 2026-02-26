// First created Week 1 by Zane Beidas
// --------

import { Router } from 'express';

import { requireAuth, acceptAuth } from '../../../util/middleware.js';
import { createPost, getPosts, getPost, searchPosts, likePost } from './posts.service.js';
import { replyToPost, getRepliesFromPost } from '../replies/replies.service.js';
import { getAttachments, deletePost} from './posts.service.js';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/post', requireAuth, upload.array('attachments', 3), async (req, res) => {
    try {
        const { id } = req.user;
        const { title, body, visibility } = req.body;
        const attachments = req.files ?? [];

        const response = await createPost(id, title, { body, attachments, visibility });

        res.status(response.status).json(response.body);
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/:post_id/like', requireAuth, async (req, res) => {
    try {
        const post_id = Number(req.params.post_id);
        const user_id = req.user.id;

        const response = await likePost(user_id, post_id);
        res.status(response.status).json(response.body);
    } catch (err) {
        if (err.code < 0) {
            return res.status(err.status).json({ message: err.message });
        }

        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/post', acceptAuth, async (req, res) => {
    try {
        const { search_term, order, id, limit } = req.query;

        const user_id = req.user?.id;
        const parsedLimit = limit ? Number.parseInt(limit) : 20;
        const parsedId = id ? Number.parseInt(id) : undefined;
        const newOrder = order === 'ascending' ? 'ascending' : 'descending';

        let result;

        if (parsedId) {
            // Get a single post
            result = await getPost(parsedId, { user_id: user_id ?? -1 });
        } else if (search_term) {
            // Search posts
            result = await searchPosts(search_term, { user_id: user_id ?? -1, limit: parsedLimit ?? 20 });
        } else {
            // Get posts
            result = await getPosts(newOrder, { user_id: user_id ?? -1, limit: parsedLimit ?? 20 });
        }

        res.status(result.status).json(result.body);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// ======== REPLIES ========

router.post('/:post_id/reply', requireAuth, async (req, res) => {
    const post_id = Number(req.params.post_id);
    const { body } = req.body;

    try {
        const response = await replyToPost(req.user.id, post_id, body);
        res.status(response.status).json(response.body);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/:post_id/reply', acceptAuth, async (req, res) => {
    const post_id = Number(req.params.post_id);
    const user_id = req.user?.id ?? -1;

    try {
        const response = await getRepliesFromPost(post_id, { user_id });
        res.status(response.status).json(response.body);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
});


// ======== GET POST ATTACHMENTS ========

router.get('/:post_id/attachments', acceptAuth, async (req, res) => {
    const post_id = Number(req.params.post_id);
    const user_id = req.user?.id ?? -1;

    try {
        const response = await getAttachments(post_id, { user_id });
        res.status(response.status).json(response.body);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// ======== DELETE POSTS ========

router.delete('/:post_id', requireAuth, async (req, res) => {
    const post_id = Number(req.params.post_id);
    const user_id = req.user.id;

    try {
        const response = await deletePost(user_id, post_id);
        res.status(response.status).json(response.body);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
