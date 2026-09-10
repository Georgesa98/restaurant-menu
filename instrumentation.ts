export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { ensureBucket } = await import('./lib/storage');
    try {
      await ensureBucket();
      console.log('Storage bucket ready');
    } catch (err) {
      console.error('Storage bucket ensure failed (uploads will 500)', err);
    }
  }
}
