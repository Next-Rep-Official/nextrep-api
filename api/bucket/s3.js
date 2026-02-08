// First created Week 2 by Zane Beidas
// --------

import { S3Client } from '@aws-sdk/client-s3';
import config from '../config.js';

export const s3 = new S3Client({
    region: config.aws.region,
    credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
    },
});

export const BUCKET_NAME = config.aws.bucketName;
