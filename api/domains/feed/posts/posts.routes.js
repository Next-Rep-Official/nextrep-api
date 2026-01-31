// First created Week 1 by Zane Beidas
// --------

import { Router } from 'express';

import { requireAuth, acceptAuth } from '../../../util/middleware.js';
import { createPost, getPosts, getPost, searchPosts } from './posts.service.js';

const router = Router();

router.post('/post', requireAuth, async (req, res) => {
    try {
        const { id } = req.user;

        const response = await createPost({ author_id: id, title: req.body.title, body: req.body.body });

        res.status(response.status).json(response.body);
    } catch (err) {
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
            result = await getPost({ user_id, post_id: parsedId });
        } else if (search_term) {
            // Search posts
            result = await searchPosts({ user_id, search_term, limit: parsedLimit });
        } else {
            // Get posts
            result = await getPosts({ user_id, order: newOrder, limit: parsedLimit });
        }

        return res.status(result.status).json(result.body);

    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' + err });
    }
});

export default router;