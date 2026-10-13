/**
 * Real-time Deployment & System Update Service
 * Detects new deployments live across all active tabs, PWA standalone windows,
 * and background workers, notifying users immediately via sound, push, and interactive UI.
 */
import { registerSW } from 'virtual:pwa-register';

export interface DeploymentInfo {
  version: string;
  buildId: string;
  buildTime: string;
  timestamp?: number;
  appName?: string;
  releaseNotes?: string;
  deployedAt?: string;
  isTest?: boolean;
}

// Injected during Vite build, with safe fallbacks
export const CURRENT_CLIENT_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '3.0.0';
export const CURRENT_CLIENT_BUILD_ID = typeof __BUILD_ID__ !== 'undefined' ? __BUILD_ID__ : `dev_${Date.now()}`;
export const CURRENT_CLIENT_BUILD_TIME = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : new Date().toISOString();

// Local session key to know what build we're currently running
const RUNNING_BUILD_KEY = 'conerage_running_build_id';
const DISMISSED_UPDATE_KEY = 'conerage_dismissed_deployment_build_id';

let activeUpdateSW: ((reloadPage?: boolean) => Promise<void>) | null = null;
let broadcastChannel: BroadcastChannel | null = null;

// Audio context synthesizer for instant real-time notification chime
export function playUpdateChime() {
  try {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Play gentle two-tone chime (E5 -> A5)
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now); // E5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now + 0.15);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.6);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.6);

    // Haptic vibration feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 60, 150]);
    }
  } catch {
    // Audio context might be restricted before user interaction
  }
}

/**
 * Checks the live server for any newly deployed version.
 */
export async function checkForServerUpdate(): Promise<{ hasUpdate: boolean; newInfo?: DeploymentInfo }> {
  try {
    const timestamp = Date.now();
    const res = await fetch(`/version.json?_t=${timestamp}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });

    if (!res.ok) {
      return { hasUpdate: false };
    }

    const serverInfo: DeploymentInfo = await res.json();
    const currentBuildId = getInitialClientBuildId();

    if (serverInfo.buildId && serverInfo.buildId !== currentBuildId) {
      return {
        hasUpdate: true,
        newInfo: serverInfo,
      };
    }

    return { hasUpdate: false };
  } catch (err) {
    console.debug('[RealtimeUpdate] Check failed (network/offline):', err);
    return { hasUpdate: false };
  }
}

/**
 * Retrieves the client's current build ID, persisting it in session if needed.
 */
export function getInitialClientBuildId(): string {
  try {
    let saved = sessionStorage.getItem(RUNNING_BUILD_KEY);
    if (!saved) {
      saved = CURRENT_CLIENT_BUILD_ID;
      sessionStorage.setItem(RUNNING_BUILD_KEY, saved);
    }
    return saved;
  } catch {
    return CURRENT_CLIENT_BUILD_ID;
  }
}

/**
 * Activates new service worker, purges stale browser caches, and reloads to new deployment.
 */
export async function applyUpdateAndReload() {
  try {
    // 1. Tell PWA service worker to activate immediately (skipWaiting)
    if (activeUpdateSW) {
      await activeUpdateSW(true);
    }

    // 2. Clear client CacheStorage to eliminate stale JS/CSS chunk hashes
    if ('caches' in window) {
      const keys = await window.caches.keys();
      await Promise.all(keys.map(k => window.caches.delete(k)));
    }

    // 3. Update service worker registrations
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        await reg.update();
      }
    }

    // 4. Force hard reload with cache-busting query
    window.location.reload();
  } catch (err) {
    console.error('[RealtimeUpdate] Error applying update:', err);
    window.location.reload();
  }
}

/**
 * Manually broadcast a test or deployment event to all open tabs.
 */
export function broadcastDeploymentEvent(info: DeploymentInfo) {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: 'DEPLOYMENT_UPDATE', info });
    } catch {
      // ignore
    }
  }

  // Trigger on local window
  window.dispatchEvent(new CustomEvent('app:new-version-deployed', { detail: info }));
}

/**
 * Initializes the real-time background watcher across Service Worker, BroadcastChannel,
 * and high-frequency polling on user activity.
 */
export function initRealtimeDeploymentWatcher(
  onUpdateDetected: (info: DeploymentInfo) => void
): () => void {
  // 1. Setup multi-tab BroadcastChannel
  try {
    if ('BroadcastChannel' in window) {
      broadcastChannel = new BroadcastChannel('conerage_realtime_deploy');
      broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'DEPLOYMENT_UPDATE' && event.data.info) {
          onUpdateDetected(event.data.info);
        }
      };
    }
  } catch {
    // fallback
  }

  // 2. Register Service Worker with live update hook
  try {
    activeUpdateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        console.log('[RealtimeUpdate] New service worker ready to activate.');
        checkForServerUpdate().then(({ newInfo }) => {
          const info = newInfo || {
            version: CURRENT_CLIENT_VERSION,
            buildId: `sw_update_${Date.now()}`,
            buildTime: new Date().toISOString(),
            releaseNotes: 'ระบบตรวจพบบันทึกการ Deploy ใหม่ผ่าน Service Worker',
          };
          onUpdateDetected(info);
          broadcastDeploymentEvent(info);
        });
      },
      onRegistered(r) {
        if (r) {
          // Periodically ask the service worker to check for updates every 30 seconds
          setInterval(() => {
            r.update().catch(() => {});
          }, 30000);
        }
      },
    });
  } catch (err) {
    console.debug('[RealtimeUpdate] SW register error:', err);
  }

  // 3. Dispatch listener for internal triggers
  const handleLocalEvent = (e: Event) => {
    const custom = e as CustomEvent<DeploymentInfo>;
    if (custom.detail) {
      onUpdateDetected(custom.detail);
    }
  };
  window.addEventListener('app:new-version-deployed', handleLocalEvent);

  // 4. Poller function
  let isChecking = false;
  const runCheck = async () => {
    if (isChecking) return;
    isChecking = true;
    try {
      const { hasUpdate, newInfo } = await checkForServerUpdate();
      if (hasUpdate && newInfo) {
        onUpdateDetected(newInfo);
        broadcastDeploymentEvent(newInfo);
      }
    } finally {
      isChecking = false;
    }
  };

  // Initial check after page stabilizes (3 seconds)
  const initialTimer = setTimeout(runCheck, 3000);

  // Periodic polling every 30 seconds
  const intervalId = setInterval(runCheck, 30000);

  // Immediate check when tab gains focus or visibility
  const handleVisibility = () => {
    if (document.visibilityState === 'visible') {
      runCheck();
    }
  };
  document.addEventListener('visibilitychange', handleVisibility);
  window.addEventListener('focus', runCheck);
  window.addEventListener('online', runCheck);

  return () => {
    clearTimeout(initialTimer);
    clearInterval(intervalId);
    document.removeEventListener('visibilitychange', handleVisibility);
    window.removeEventListener('focus', runCheck);
    window.removeEventListener('online', runCheck);
    window.removeEventListener('app:new-version-deployed', handleLocalEvent);
    if (broadcastChannel) {
      broadcastChannel.close();
      broadcastChannel = null;
    }
  };
}
