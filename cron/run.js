import removeStrayAssets from './jobs/remove_stray_assets.js';

// Run jobs and exit with status code
try {
    await removeStrayAssets();
    process.exit(0);
} catch (error) {
    console.error(error);
    process.exit(1);
}