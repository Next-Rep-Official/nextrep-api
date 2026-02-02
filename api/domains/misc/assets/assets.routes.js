// First created Week 2 by Zane Beidas
// --------

import { Router } from 'express';
import { getAsset } from './assets.service.js';
import multer from 'multer';
import { acceptAuth } from '../../../util/middleware.js';

import { getSignedUrl } from '../../../bucket/helpers/load.js';
import { removeFile } from '../../../bucket/helpers/remove.js';


const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get an asset by its id
router.get('/:id', acceptAuth, async (req, res) => {
    const result = await getAsset(Number(req.params.id), { user_id: req.user?.id });
    res.status(result.status).json(result.body);
});

export default router;