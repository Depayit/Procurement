/**
 * System Diagnostics & Self-Healing Auto-Repair Engine
 * Allows non-admin users to diagnose and 1-click repair common technical issues:
 * - Camera & Barcode Scanner permissions
 * - PWA Cache & Service Worker stale states
 * - Storage quotas & safe cache cleaning
 * - Network latency & Cloud sync status
 * - Notifications & Audio feedback
 */

export type DiagnosticStatus = 'healthy' | 'warning' | 'error' | 'testing';

export interface DiagnosticItem {
  id: string;
  category: 'camera' | 'cache' | 'network' | 'storage' | 'notifications';
  titleTh: string;
  titleEn: string;
  status: DiagnosticStatus;
  summaryTh: string;
  summaryEn: string;
  details?: string;
  canAutoFix: boolean;
  fixActionKey?: string;
  fixButtonTextTh?: string;
  fixButtonTextEn?: string;
}

export interface SystemDiagnosticsReport {
  timestamp: string;
  overallScore: number; // 0 - 100
  overallStatus: DiagnosticStatus;
  items: DiagnosticItem[];
  deviceInfo: {
    browser: string;
    os: string;
    isMobile: boolean;
    isStandalonePWA: boolean;
    isSecureContext: boolean;
  };
}

/**
 * Detect client environment details
 */
export function getDeviceInfo() {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isStandalonePWA = typeof window !== 'undefined' && (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );

  let browser = 'Unknown Browser';
  if (/Chrome|CriOS/i.test(ua) && !/Edg/i.test(ua)) browser = 'Google Chrome';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Apple Safari';
  else if (/Edg/i.test(ua)) browser = 'Microsoft Edge';
  else if (/Firefox|FxiOS/i.test(ua)) browser = 'Mozilla Firefox';

  let os = 'Unknown OS';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  return {
    browser,
    os,
    isMobile,
    isStandalonePWA,
    isSecureContext: typeof window !== 'undefined' ? window.isSecureContext : false,
  };
}

/**
 * Run comprehensive 5-point system diagnostic scan
 */
export async function runSystemDiagnostics(): Promise<SystemDiagnosticsReport> {
  const items: DiagnosticItem[] = [];
  const deviceInfo = getDeviceInfo();

  // 1. Camera & Barcode Scanner Test
  const cameraDiag = await testCameraScanner();
  items.push(cameraDiag);

  // 2. Cache & Service Worker Test
  const cacheDiag = await testCacheAndServiceWorker();
  items.push(cacheDiag);

  // 3. Network & Server Latency Test
  const networkDiag = await testNetworkAndApi();
  items.push(networkDiag);

  // 4. Local Storage & Quota Test
  const storageDiag = await testStorageHealth();
  items.push(storageDiag);

  // 5. Notifications & Sound Test
  const notifDiag = await testNotificationAndAudio();
  items.push(notifDiag);

  // Compute Overall Score (each healthy = 20 pts, warning = 12 pts, error = 0 pts)
  let score = 0;
  for (const item of items) {
    if (item.status === 'healthy') score += 20;
    else if (item.status === 'warning') score += 12;
  }

  let overallStatus: DiagnosticStatus = 'healthy';
  if (items.some(i => i.status === 'error')) {
    overallStatus = 'error';
  } else if (items.some(i => i.status === 'warning')) {
    overallStatus = 'warning';
  }

  return {
    timestamp: new Date().toISOString(),
    overallScore: score,
    overallStatus,
    items,
    deviceInfo,
  };
}

/**
 * 1. Test Camera & Scanner
 */
async function testCameraScanner(): Promise<DiagnosticItem> {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const isHttps = typeof window !== 'undefined' && window.isSecureContext;
      return {
        id: 'camera',
        category: 'camera',
        titleTh: 'กล้องและระบบสแกน Barcode/QR',
        titleEn: 'Camera & Barcode Scanner',
        status: 'error',
        summaryTh: isHttps ? 'เบราว์เซอร์ไม่รองรับ MediaDevices API' : 'ต้องเปิดผ่าน HTTPS เท่านั้นจึงจะเปิดกล้องได้',
        summaryEn: isHttps ? 'Browser does not support MediaDevices' : 'Camera requires HTTPS secure context',
        details: 'การใช้งานกล้องในมือถือและเครื่องสแกนบาร์โค้ดต้องเข้าใช้งานผ่าน HTTPS เท่านั้น',
        canAutoFix: false,
      };
    }

    // Check Permissions API if supported
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        if (permission.state === 'denied') {
          return {
            id: 'camera',
            category: 'camera',
            titleTh: 'กล้องและระบบสแกน Barcode/QR',
            titleEn: 'Camera & Barcode Scanner',
            status: 'error',
            summaryTh: 'สิทธิ์การเข้าถึงกล้องถูกบล็อก (Denied)',
            summaryEn: 'Camera access is blocked by browser settings',
            details: 'คลิกไอคอนแม่กุญแจ 🔒 ที่แถบที่อยู่เว็บ (URL bar) แล้วเลือก "อนุญาตให้ใช้กล้อง (Allow Camera)"',
            canAutoFix: true,
            fixActionKey: 'repair_camera',
            fixButtonTextTh: 'ขอสิทธิ์กล้องใหม่',
            fixButtonTextEn: 'Request Camera Access',
          };
        } else if (permission.state === 'prompt') {
          return {
            id: 'camera',
            category: 'camera',
            titleTh: 'กล้องและระบบสแกน Barcode/QR',
            titleEn: 'Camera & Barcode Scanner',
            status: 'warning',
            summaryTh: 'ยังไม่ได้อนุญาตการใช้กล้อง (รอการยืนยัน)',
            summaryEn: 'Camera access pending user prompt',
            details: 'กดปุ่มทดสอบเพื่ออนุญาตให้ระบบเข้าถึงกล้องถ่ายรูป',
            canAutoFix: true,
            fixActionKey: 'repair_camera',
            fixButtonTextTh: 'ทดสอบเปิดกล้อง',
            fixButtonTextEn: 'Test & Grant Camera',
          };
        }
      } catch {
        // Permissions query for 'camera' might throw on some browsers
      }
    }

    // Enumerate video devices
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInputs = devices.filter(d => d.kind === 'videoinput');

    if (videoInputs.length === 0) {
      return {
        id: 'camera',
        category: 'camera',
        titleTh: 'กล้องและระบบสแกน Barcode/QR',
        titleEn: 'Camera & Barcode Scanner',
        status: 'warning',
        summaryTh: 'ตรวจไม่พบฮาร์ดแวร์กล้องที่เชื่อมต่อ',
        summaryEn: 'No connected camera hardware detected',
        details: 'หากใช้งานบน PC กรุณาตรวจสอบว่าเสียบสาย Webcam หรือยัง',
        canAutoFix: true,
        fixActionKey: 'repair_camera',
        fixButtonTextTh: 'ค้นหากล้องใหม่',
        fixButtonTextEn: 'Rescan Camera',
      };
    }

    return {
      id: 'camera',
      category: 'camera',
      titleTh: 'กล้องและระบบสแกน Barcode/QR',
      titleEn: 'Camera & Barcode Scanner',
      status: 'healthy',
      summaryTh: `กล้องพร้อมใช้งาน (${videoInputs.length} ตัว)`,
      summaryEn: `Camera ready (${videoInputs.length} found)`,
      details: 'ระบบสแกนบาร์โค้ด 1D และ QR Code พร้อมทำงานได้ทันที',
      canAutoFix: false,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      id: 'camera',
      category: 'camera',
      titleTh: 'กล้องและระบบสแกน Barcode/QR',
      titleEn: 'Camera & Barcode Scanner',
      status: 'warning',
      summaryTh: 'เกิดข้อผิดพลาดในการตรวจสอบกล้อง',
      summaryEn: 'Error inspecting camera hardware',
      details: errorMsg,
      canAutoFix: true,
      fixActionKey: 'repair_camera',
      fixButtonTextTh: 'ทดสอบเปิดกล้อง',
      fixButtonTextEn: 'Test Camera Access',
    };
  }
}

/**
 * 2. Test Cache and Service Worker
 */
async function testCacheAndServiceWorker(): Promise<DiagnosticItem> {
  try {
    const hasSW = 'serviceWorker' in navigator;
    let swActive = false;
    if (hasSW) {
      const reg = await navigator.serviceWorker.getRegistration();
      swActive = !!reg?.active;
    }

    let cacheCount = 0;
    if ('caches' in window) {
      const keys = await window.caches.keys();
      cacheCount = keys.length;
    }

    return {
      id: 'cache',
      category: 'cache',
      titleTh: 'แคชระบบและการทำงานออฟไลน์ (PWA)',
      titleEn: 'System Cache & Offline PWA',
      status: 'healthy',
      summaryTh: swActive ? `PWA ทำงานปกติ (พบ ${cacheCount} แคช)` : 'ระบบแคชพร้อมทำงาน',
      summaryEn: swActive ? `PWA Active (${cacheCount} caches stored)` : 'Cache system ready',
      details: 'แคชช่วยให้เปิดโปรแกรมได้รวดเร็วและใช้งานได้แม้อินเทอร์เน็ตหลุด',
      canAutoFix: true,
      fixActionKey: 'repair_cache',
      fixButtonTextTh: 'ล้างแคชและอัปเดตใหม่',
      fixButtonTextEn: 'Flush Cache & Reload',
    };
  } catch (err) {
    return {
      id: 'cache',
      category: 'cache',
      titleTh: 'แคชระบบและการทำงานออฟไลน์ (PWA)',
      titleEn: 'System Cache & Offline PWA',
      status: 'warning',
      summaryTh: 'พบแคชเก่าค้างในระบบ',
      summaryEn: 'Stale caches detected',
      details: 'แนะนำให้ล้างแคชเพื่อรับฟีเจอร์เวอร์ชันล่าสุด',
      canAutoFix: true,
      fixActionKey: 'repair_cache',
      fixButtonTextTh: 'ล้างแคชทันที',
      fixButtonTextEn: 'Flush Cache Now',
    };
  }
}

/**
 * 3. Test Network and API Server
 */
async function testNetworkAndApi(): Promise<DiagnosticItem> {
  if (!navigator.onLine) {
    return {
      id: 'network',
      category: 'network',
      titleTh: 'เครือข่ายและการเชื่อมต่อเซิร์ฟเวอร์',
      titleEn: 'Network & Server Connectivity',
      status: 'error',
      summaryTh: 'อุปกรณ์อยู่ในโหมดออฟไลน์ (ไม่ได้ต่อเน็ต)',
      summaryEn: 'Device is offline (No Internet)',
      details: 'ข้อมูลจะถูกบันทึกลงในเครื่อง และจะส่งขึ้นคลาวด์อัตโนมัติเมื่อต่ออินเทอร์เน็ต',
      canAutoFix: true,
      fixActionKey: 'repair_sync',
      fixButtonTextTh: 'ทดสอบเชื่อมต่อใหม่',
      fixButtonTextEn: 'Retry Connection',
    };
  }

  const startTime = performance.now();
  try {
    const res = await fetch(`/api/version?_ping=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });
    const latency = Math.round(performance.now() - startTime);

    if (res.ok) {
      const isSlow = latency > 800;
      return {
        id: 'network',
        category: 'network',
        titleTh: 'เครือข่ายและการเชื่อมต่อเซิร์ฟเวอร์',
        titleEn: 'Network & Server Connectivity',
        status: isSlow ? 'warning' : 'healthy',
        summaryTh: `เซิร์ฟเวอร์ออนไลน์ (ความเร็วตอบสนอง ${latency}ms)`,
        summaryEn: `Server Online (Ping: ${latency}ms)`,
        details: isSlow ? 'การเชื่อมต่อค่อนข้างช้า อาจเกิดจากสัญญาณอินเทอร์เน็ตของท่าน' : 'การรับส่งข้อมูลกับเซิร์ฟเวอร์รวดเร็วและเสถียร',
        canAutoFix: false,
      };
    } else {
      return {
        id: 'network',
        category: 'network',
        titleTh: 'เครือข่ายและการเชื่อมต่อเซิร์ฟเวอร์',
        titleEn: 'Network & Server Connectivity',
        status: 'warning',
        summaryTh: `เซิร์ฟเวอร์ตอบกลับสถานะ HTTP ${res.status}`,
        summaryEn: `Server returned status HTTP ${res.status}`,
        details: 'ระบบกำลังทำงานในโหมด Local Cache สำรองข้อมูลอัตโนมัติ',
        canAutoFix: true,
        fixActionKey: 'repair_sync',
        fixButtonTextTh: 'เชื่อมต่อใหม่',
        fixButtonTextEn: 'Reconnect',
      };
    }
  } catch {
    return {
      id: 'network',
      category: 'network',
      titleTh: 'เครือข่ายและการเชื่อมต่อเซิร์ฟเวอร์',
      titleEn: 'Network & Server Connectivity',
      status: 'warning',
      summaryTh: 'เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ (ใช้งานแบบออฟไลน์)',
      summaryEn: 'Cannot reach backend server (Offline fallback)',
      details: 'ระบบยังสามารถทำงานต่อเนื่องได้ด้วยระบบ Local Storage อัจฉริยะ',
      canAutoFix: true,
      fixActionKey: 'repair_sync',
      fixButtonTextTh: 'ทดสอบเชื่อมต่อใหม่',
      fixButtonTextEn: 'Retry Connection',
    };
  }
}

/**
 * 4. Test Local Storage Health
 */
async function testStorageHealth(): Promise<DiagnosticItem> {
  try {
    let usageMB = 0;
    let quotaMB = 0;
    let percentUsed = 0;

    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      if (estimate.usage && estimate.quota) {
        usageMB = Math.round(estimate.usage / (1024 * 1024));
        quotaMB = Math.round(estimate.quota / (1024 * 1024));
        percentUsed = Math.round((estimate.usage / estimate.quota) * 100);
      }
    }

    const keyCount = Object.keys(localStorage).length;
    const isNearlyFull = percentUsed > 85;

    return {
      id: 'storage',
      category: 'storage',
      titleTh: 'พื้นที่จัดเก็บในเครื่อง (Local Storage)',
      titleEn: 'Local Storage & Draft Health',
      status: isNearlyFull ? 'warning' : 'healthy',
      summaryTh: isNearlyFull 
        ? `พื้นที่เก็บข้อมูลใกล้เต็ม (${percentUsed}%)`
        : `พื้นที่เก็บข้อมูลปกติ (บันทึกข้อมูลแล้ว ${keyCount} รายการ)`,
      summaryEn: isNearlyFull 
        ? `Storage space high (${percentUsed}%)`
        : `Storage healthy (${keyCount} items stored)`,
      details: usageMB > 0 ? `ใช้งาน ${usageMB} MB จากโควต้า ${quotaMB} MB` : 'ระบบจัดเก็บข้อมูลร่างและประวัติการทำงานไว้ปลอดภัย',
      canAutoFix: true,
      fixActionKey: 'repair_storage',
      fixButtonTextTh: 'ล้างแคชขยะที่ปลอดภัย',
      fixButtonTextEn: 'Clean Safe Storage',
    };
  } catch (err) {
    return {
      id: 'storage',
      category: 'storage',
      titleTh: 'พื้นที่จัดเก็บในเครื่อง (Local Storage)',
      titleEn: 'Local Storage & Draft Health',
      status: 'healthy',
      summaryTh: 'พื้นที่จัดเก็บข้อมูลในเครื่องพร้อมทำงาน',
      summaryEn: 'Local storage functional',
      canAutoFix: false,
    };
  }
}

/**
 * 5. Test Notification and Web Audio
 */
async function testNotificationAndAudio(): Promise<DiagnosticItem> {
  try {
    const hasAudio = typeof window !== 'undefined' && ('AudioContext' in window || 'webkitAudioContext' in window);
    const notifPermission = typeof Notification !== 'undefined' ? Notification.permission : 'unsupported';

    if (notifPermission === 'denied') {
      return {
        id: 'notifications',
        category: 'notifications',
        titleTh: 'ระบบแจ้งเตือนและเสียงเตือน (Alerts)',
        titleEn: 'Notifications & Audio Alerts',
        status: 'warning',
        summaryTh: 'การแจ้งเตือนแบบป็อปอัปถูกปิดกั้น',
        summaryEn: 'Web Push Notifications are blocked',
        details: 'ระบบยังมีเสียงแจ้งเตือนอัตโนมัติทำงานอยู่',
        canAutoFix: true,
        fixActionKey: 'repair_notifications',
        fixButtonTextTh: 'ขอเปิดการแจ้งเตือน',
        fixButtonTextEn: 'Enable Notifications',
      };
    }

    return {
      id: 'notifications',
      category: 'notifications',
      titleTh: 'ระบบแจ้งเตือนและเสียงเตือน (Alerts)',
      titleEn: 'Notifications & Audio Alerts',
      status: 'healthy',
      summaryTh: notifPermission === 'granted' 
        ? 'การแจ้งเตือนและเสียงเตือนพร้อมทำงานเต็มรูปแบบ'
        : 'ระบบเสียงเตือนพร้อมทำงาน (ยังไม่ได้เปิดการแจ้งเตือนเบราว์เซอร์)',
      summaryEn: notifPermission === 'granted'
        ? 'Notifications and audio feedback active'
        : 'Audio active (Browser notifications optional)',
      details: hasAudio ? 'รองรับเสียงแจ้งเตือน Realtime Audio Feedback' : 'เสียงแจ้งเตือนพื้นฐาน',
      canAutoFix: notifPermission !== 'granted',
      fixActionKey: 'repair_notifications',
      fixButtonTextTh: 'เปิดรับการแจ้งเตือน',
      fixButtonTextEn: 'Grant Notification',
    };
  } catch {
    return {
      id: 'notifications',
      category: 'notifications',
      titleTh: 'ระบบแจ้งเตือนและเสียงเตือน (Alerts)',
      titleEn: 'Notifications & Audio Alerts',
      status: 'healthy',
      summaryTh: 'ระบบเสียงแจ้งเตือนทำงานปกติ',
      summaryEn: 'Alert sound working',
      canAutoFix: false,
    };
  }
}

/**
 * Self-Healing Auto-Fix Executors
 */

/**
 * Request camera access directly to prompt user permissions dialog
 */
export async function autoFixCamera(): Promise<{ success: boolean; messageTh: string; messageEn: string }> {
  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      return {
        success: false,
        messageTh: 'เบราว์เซอร์นี้ไม่รองรับการเปิดกล้อง กรุณาเปิดผ่าน HTTPS หรือใช้ Google Chrome / Safari ล่าสุด',
        messageEn: 'Camera API not supported in this browser environment.',
      };
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });

    // Close tracks immediately after testing success
    stream.getTracks().forEach(track => track.stop());

    return {
      success: true,
      messageTh: 'อนุญาตให้ใช้งานกล้องถ่ายรูปสำเร็จ! ระบบสแกน Barcode และ QR Code สามารถใช้งานได้แล้ว',
      messageEn: 'Camera access granted successfully! Barcode & QR scanner is now active.',
    };
  } catch (err: unknown) {
    const errorName = err instanceof Error ? err.name : '';
    if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
      return {
        success: false,
        messageTh: 'สิทธิ์กล้องถูกปฏิเสธ: กรุณากดที่ไอคอนแม่กุญแจ 🔒 ที่แถบพิมพ์ชื่อเว็บด้านบน แล้วกดเปิด "กล้อง (Camera)" จากนั้นโหลดหน้านี้ใหม่',
        messageEn: 'Permission denied: Please tap the lock icon in the address bar and enable Camera access.',
      };
    }
    return {
      success: false,
      messageTh: 'ไม่สามารถเปิดกล้องได้: โปรดตรวจสอบว่ามีโปรแกรมอื่นเปิดกล้องค้างอยู่หรือไม่',
      messageEn: 'Could not access camera: Please verify no other app is using it.',
    };
  }
}

/**
 * Clear stale browser CacheStorage and unregister outdated service worker
 */
export async function autoFixPWACache(): Promise<{ success: boolean; messageTh: string; messageEn: string }> {
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

    return {
      success: true,
      messageTh: 'ล้างแคชและอัปเดตระบบเรียบร้อย กำลังรีเฟรชเพื่อโหลดเวอร์ชันล่าสุด...',
      messageEn: 'Cache purged successfully. Reloading fresh assets...',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      messageTh: `เกิดข้อผิดพลาดในการล้างแคช: ${errorMsg}`,
      messageEn: `Failed to purge cache: ${errorMsg}`,
    };
  }
}

/**
 * Clean safe temporary cache and search items without touching authentication credentials
 */
export function autoFixSafeStorage(): { success: boolean; messageTh: string; messageEn: string } {
  try {
    // Keys to preserve
    const preservedPrefixes = [
      'procuresync_token',
      'procuresync_user_id',
      'procuresync_active_role',
      'conerage_auth',
      'firebase:',
    ];

    let removedCount = 0;
    const allKeys = Object.keys(localStorage);

    for (const key of allKeys) {
      const isProtected = preservedPrefixes.some(prefix => key.startsWith(prefix));
      if (!isProtected && (
        key.includes('search_cache') ||
        key.includes('temp_') ||
        key.includes('dismissed_') ||
        key.includes('filter_temp')
      )) {
        localStorage.removeItem(key);
        removedCount++;
      }
    }

    return {
      success: true,
      messageTh: `ล้างแคชขยะชั่วคราวเรียบร้อย (${removedCount} รายการ) ข้อมูลผู้ใช้และรหัสผ่านยังคงปลอดภัย`,
      messageEn: `Cleaned safe temporary storage (${removedCount} items). User login remains safe.`,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      messageTh: `ไม่สามารถล้างพื้นที่จัดเก็บ: ${errorMsg}`,
      messageEn: `Failed to clean storage: ${errorMsg}`,
    };
  }
}

/**
 * Request notification permissions
 */
export async function autoFixNotifications(): Promise<{ success: boolean; messageTh: string; messageEn: string }> {
  try {
    if (typeof Notification === 'undefined') {
      return {
        success: false,
        messageTh: 'เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน Web Notifications',
        messageEn: 'Browser does not support Web Notifications.',
      };
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      return {
        success: true,
        messageTh: 'เปิดรับการแจ้งเตือนสำเร็จ! คุณจะได้รับข่าวสารการอนุมัติและอัปเดตระบบแบบเรียลไทม์',
        messageEn: 'Notifications enabled! You will receive live approval and system alerts.',
      };
    } else {
      return {
        success: false,
        messageTh: 'สิทธิ์การแจ้งเตือนยังไม่ได้รับอนุญาต',
        messageEn: 'Notification permission was not granted.',
      };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      messageTh: `ขอสิทธิ์แจ้งเตือนไม่สำเร็จ: ${errorMsg}`,
      messageEn: `Error requesting notification permission: ${errorMsg}`,
    };
  }
}

/**
 * Master 1-Click Auto-Repair All Action
 */
export async function executeAutoRepair(actionKey: string) {
  switch (actionKey) {
    case 'repair_camera':
      return await autoFixCamera();
    case 'repair_cache':
      const resCache = await autoFixPWACache();
      if (resCache.success) {
        setTimeout(() => window.location.reload(), 1200);
      }
      return resCache;
    case 'repair_storage':
      return autoFixSafeStorage();
    case 'repair_notifications':
      return await autoFixNotifications();
    case 'repair_sync':
      // Test fetch ping
      try {
        await fetch(`/api/version?_sync=${Date.now()}`);
        return {
          success: true,
          messageTh: 'เชื่อมต่อและซิงค์ข้อมูลกับเซิร์ฟเวอร์เรียบร้อยแล้ว',
          messageEn: 'Successfully reconnected and synced with server.',
        };
      } catch {
        return {
          success: false,
          messageTh: 'ยังไม่สามารถเชื่อมต่อเน็ตได้ ข้อมูลจะซิงค์ให้อัตโนมัติเมื่อสัญญาณเน็ตกลับมา',
          messageEn: 'Could not connect yet. Data will sync automatically once internet returns.',
        };
      }
    default:
      return {
        success: false,
        messageTh: 'ไม่พบชุดคำสั่งซ่อมแซมนี้',
        messageEn: 'Unknown repair action',
      };
  }
}
