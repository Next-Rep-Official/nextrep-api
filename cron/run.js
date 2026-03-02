import removeStrayAssets from './jobs/remove_stray_assets.js';

// Run jobs and exit with status code
try {
    // Run all jobs
    console.log('Running jobs...');
    await removeStrayAssets();

    // Log success and exit with status code 0
    console.log('Jobs completed successfully ✅');
    process.exit(0);
} catch (error) {
    // Log error and exit with status code 1
    console.error(error);
    process.exit(1);
}