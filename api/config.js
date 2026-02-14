// First created Week 2 by Zane Beidas
// --------

import dotenv from 'dotenv';

dotenv.config();


// ======== CONFIG ======== //

export default {
    jwt: {
        secret: process.env.JWT_SECRET,
    },
    database: {
        url: process.env.DATABASE_URL,
    },
    aws: {
        region: process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        bucketName: process.env.AWS_S3_BUCKET_NAME,
        endpoint: process.env.AWS_ENDPOINT_URL,
    },
};