// Created Week 6 by Zane Beidas
// --------

import pool from '../../api/storage/database/db.js';
import {s3, BUCKET_NAME} from '../../api/storage/bucket/s3.js';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

export default async function removeStrayS3Objects() {
    try {
        const { rows } = await pool.query('SELECT * FROM cleanup WHERE type = $1', ['delete_s3_object']);

        console.log("\n ======== BEGINNING TO CHECK S3 OBJECTS ========= \n")

        if (rows.length === 0) {
            console.log("✅ No stray s3 objects found");
            return true;
        }

        for (const row of rows) {
            let path = null;
            let filename = null;
            try {
                const payload = JSON.parse(row.data);
                path = payload.path;
                filename = payload.filename;
            } catch (error) {
                console.error('❌ Error parsing cleanup data:', error.message);
                await pool.query('DELETE FROM cleanup WHERE id = $1', [row.id]);
                continue;
            }

            const command = new DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: path + '/' + filename,
            });

            try {
                await s3.send(command);
                await pool.query('DELETE FROM cleanup WHERE id = $1', [row.id]);
                console.log("✅ S3 object " + path + '/' + filename + " deleted successfully");
            } catch (error) {
                if (error.$metadata?.httpStatusCode === 404) {
                    await pool.query('DELETE FROM cleanup WHERE id = $1', [row.id]);
                    console.log("✅ S3 object " + path + '/' + filename + " deleted successfully");
                } else {
                    console.error('❌ Error deleting s3 object ' + path + '/' + filename + ':', error);
                }
            }
        }

        console.log("\n ======== FINISHED CHECKING S3 OBJECTS ========= \n");

        return true;
    } catch (error) {
        console.error('❌ Error removing stray s3 objects:', error);
        return false;
    }
}