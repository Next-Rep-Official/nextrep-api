// First created Week 2 by Zane Beidas
// --------

import { s3, BUCKET_NAME } from '../s3.js';
import crypto from 'crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';

/**
 * Uploads a file to the S3 bucket
 *
 * @param {File} file the file to upload
 * @param {string} path the path to upload the file to
 * @param {string} filename the filename to use for the uploaded file, if not provided, a random UUID will be generated
 *
 * @returns {Promise<string>} The filename of the uploaded file
 */
export async function uploadFile(file, path, filename = null) {
    const key = `${path}/${filename || crypto.randomUUID()}`;

    const uploadParams = {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    };
    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);

    return key.split('/').pop();
}

/**
 *
 * @param {File[]} files the files to upload
 * @param {string} path the path to upload the files to
 *
 * @returns {Promise<string[]>} The filenames of the uploaded files
 */
export async function uploadAllFiles(files, path) {
    return await Promise.all(files.map(async (file) => await uploadFile(file, path)));
}

/**
 * Gets the path of a file in the S3 bucket
 * 
 * @param {string} owner_type the type of the owner
 * @param {string} owner_id the ID of the owner
 * @param {string} type the type of the asset
 *
 * @returns {string} The path of the file
 */
export function getPath(owner_type, owner_id, type) {
    const path = `assets/${owner_type}/${owner_id}/${type}`;

    return path;
}