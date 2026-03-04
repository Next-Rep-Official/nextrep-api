// First created Week 2 by Zane Beidas
// --------

import { Router } from 'express';
import { getAsset, removeAsset } from './assets.service.js';
import multer from 'multer';
import { acceptAuth } from '../../../util/middleware.js';
import { getUrl } from './assets.service.js';
const router = Router();


// Get an asset by its id
router.get('/:id', acceptAuth, async (req, res) => {
    try {
        const result = await getAsset(Number(req.params.id), { user_id: req.user?.id ?? -1 });
        res.status(result.status).json(result.body);
    } catch (err) {
        console.error('[assets] GET /:id 500:', err?.message ?? err, err?.stack);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/url/:id', acceptAuth, async (req, res) => {
    try {
        const user_id = req.user?.id ?? -1;
        const result = await getUrl(Number(req.params.id), { user_id: Number(user_id) });
        res.status(result.status).json(result.body);
    } catch (err) {
        console.error('[assets] GET /url/:id 500:', err?.message ?? err, err?.stack);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// router.delete('/test-delete/:id', acceptAuth, async (req, res) => {
//     try {
//         const result = await removeAsset(Number(req.params.id));
//         res.status(result.status).json(result.body);
//     } catch (err) {
//         console.error('[assets] DELETE /test-delete/:id 500:', err?.message ?? err, err?.stack);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

export default router;
