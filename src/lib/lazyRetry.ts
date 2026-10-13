import { lazy, type ComponentType } from 'react';

/**
 * Robust lazy wrapper that automatically recovers when a new deployment
 * has changed asset chunk hashes on the server (Vercel/Hosting).
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T } | any>,
  pageName: string
) {
  return lazy(async () => {
    const retryKey = `procuresync_chunk_retry_${pageName}`;
    const hasAlreadyRetried = sessionStorage.getItem(retryKey) === 'true';

    try {
      const component = await componentImport();
      // Reset retry flag on successful load
      sessionStorage.removeItem(retryKey);
      return component;
    } catch (error: any) {
      const errorMessage = String(error?.message || error || '');
      const isDynamicChunkError =
        /Failed to fetch dynamically imported module|Loading chunk|dynamically imported module|Importing a module script failed/i.test(
          errorMessage
        );

      if (isDynamicChunkError && !hasAlreadyRetried) {
        sessionStorage.setItem(retryKey, 'true');
        console.warn(`[ProcureSync] Chunk for "${pageName}" was outdated after deployment. Auto-reloading latest version...`);

        // Clean up outdated Service Worker caches before reloading
        if (typeof window !== 'undefined' && 'caches' in window) {
          try {
            const cacheKeys = await window.caches.keys();
            await Promise.all(cacheKeys.map(k => window.caches.delete(k)));
          } catch {
            // ignore cache deletion errors
          }
        }

        // Hard reload from server
        window.location.reload();
        // Return a pending promise so React Suspense waits for the page reload
        return new Promise(() => {});
      }

      // If already retried or not a chunk error, forward to ErrorBoundary
      throw error;
    }
  });
}
