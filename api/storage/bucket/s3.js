// First created Week 2 by Zane Beidas
// --------

import { S3Client } from '@aws-sdk/client-s3';
import config from '../../../config.js';

export const s3 = new S3Client({
    region: config.aws.region,
    endpoint: config.aws.endpoint || undefined,
    forcePathStyle: false,
    credentials: {
        accessKeyId: config.aws.accessKeyId?.trim(),
        secretAccessKey: config.aws.secretAccessKey?.trim(),
    },
});


export const BUCKET_NAME = config.aws.bucketName;
