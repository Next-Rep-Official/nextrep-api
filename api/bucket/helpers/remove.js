// First created Week 2 by Zane Beidas
// --------

import { s3, BUCKET_NAME } from '../s3.js';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

/**
 * Removes a file from the S3 bucket
 * 
 * @param {string} path the path to the file
 * @param {string} filename the filename of the file
 */
export async function removeFile(path, filename) {
    const key = `${path}/${filename}`;
    const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });
    await s3.send(command);
}

/**
 * Removes multiple files from the S3 bucket
 * 
 * @param {string} path the path to the files
 * @param {string[]} filenames the filenames of the files
 */
export async function removeFiles(path, filenames) {
    return await Promise.all(filenames.map(async (filename) => await removeFile(path, filename)));
}