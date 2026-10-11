import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Detect standalone mode (already installed as PWA)
    const checkIsInstalled = () => {
      if (typeof window === 'undefined') return false;
      const isStandaloneMatch = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      const isDocumentReferrer = document.referrer.includes('android-app://');
      return isStandaloneMatch || isIOSStandalone || isDocumentReferrer;
    };

    setIsInstalled(checkIsInstalled());

    // Platform detection
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent.toLowerCase();
      const ios = /iphone|ipad|ipod/.test(ua);
      const android = /android/.test(ua);
      setIsIOS(ios);
      setIsAndroid(android);
      setIsDesktop(!ios && !android);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async (): Promise<'accepted' | 'dismissed' | 'guide'> => {
    if (!deferredPrompt) {
      return 'guide';
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        return 'accepted';
      }
      return 'dismissed';
    } catch (err) {
      console.warn('PWA install prompt error:', err);
      return 'guide';
    }
  };

  /**
   * Clears PWA caches and forces reload to ensure the latest version is loaded.
   */
  const clearCacheAndUpdate = async () => {
    if (typeof window === 'undefined') return;

    try {
      if ('caches' in window) {
        const keys = await window.caches.keys();
        await Promise.all(keys.map(k => window.caches.delete(k)));
      }

      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.update();
        }
      }

      window.location.reload();
    } catch (e) {
      console.error('Error clearing cache:', e);
      window.location.reload();
    }
  };

  return {
    isInstallable: !isInstalled,
    canPromptNative: !!deferredPrompt,
    isInstalled,
    isIOS,
    isAndroid,
    isDesktop,
    install,
    clearCacheAndUpdate,
  };
}
