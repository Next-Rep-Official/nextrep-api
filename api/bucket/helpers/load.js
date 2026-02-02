// First created Week 2 by Zane Beidas
// --------

import { s3, BUCKET_NAME } from '../s3.js';
import crypto from 'crypto'
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as awsGetSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Gets a signed URL for a file in the S3 bucket
 * 
 * @param {string} path the path to the file
 * @param {string} filename the filename of the file
 * 
 * @returns {Promise<string>} The signed URL
 */
export async function getSignedUrl(path, filename) {
    const key = `${path}/${filename}`;

    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });

    const signedUrl = await awsGetSignedUrl(s3, command, { expiresIn: 60 * 60 * 24 }); // 1 day

    return signedUrl;
}

/**
 * Gets signed URLs for multiple files in the S3 bucket
 * 
 * @param {string} path the path to the files
 * @param {string[]} filenames the filenames of the files
 * 
 * @returns {Promise<string[]>} The signed URLs
 */
export async function getSignedUrls(path, filenames) {
    return await Promise.all(filenames.map(async (filename) => await getSignedUrl(path, filename)));
}