// First created Week 2 by Zane Beidas
// --------

import { Router } from 'express';
import { getAsset } from './assets.service.js';
import multer from 'multer';
import { acceptAuth } from '../../../util/middleware.js';
import { getUrl } from './assets.service.js';
const router = Router();


// Get an asset by its id
router.get('/:id', acceptAuth, async (req, res) => {
    const result = await getAsset(Number(req.params.id), { user_id: req.user?.id ?? -1 });
    res.status(result.status).json(result.body);
});

router.get('/url/:id', acceptAuth, async (req, res) => {
    const { id } = req.user ?? -1;
    
    const result = await getUrl(Number(req.params.id), { user_id: id });
    res.status(result.status).json(result.body);
});

export default router;
