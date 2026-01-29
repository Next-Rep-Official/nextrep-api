// First created Week 1 by Zane Beidas
// --------

import jwt from 'jsonwebtoken';

/**
 * Use this as middleware to force users to be authenticated
 *
 * @param {Request} req The request data
 * @param {Response} res The response data
 * @param {*} next The next thing to run after this
 * @returns
 */
export function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Missing token' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        // attach user to request
        req.user = payload;

        // allow route to continue
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

/**
 * Use this as middleware to allow unauthenticated users to pass through
 * but without returning a user payload to the request
 *
 * @param {Request} req The request data
 * @param {Response} res The response data
 * @param {*} next The next thing to run after this
 * @returns
 */
export function acceptAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next()
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        // attach user to request
        req.user = payload;

        // allow route to continue
        next();
    } catch (err) {
        next();
    }
}
