import liff from '@line/liff';

let liffInitPromise = null;

/**
 * Initializes LINE LIFF SDK and retrieves user profile if available.
 * @returns {Promise<{ isLiff: boolean, isLoggedIn: boolean, lineUserId: string|null, lineDisplayName: string|null, linePictureUrl: string|null, error: string|null }>}
 */
export async function initLiff() {
  const liffId = import.meta.env.VITE_LIFF_ID;

  if (!liffId) {
    console.warn('[LIFF] VITE_LIFF_ID is not configured in .env');
    return {
      isLiff: false,
      isLoggedIn: false,
      lineUserId: null,
      lineDisplayName: null,
      linePictureUrl: null,
      error: 'VITE_LIFF_ID missing'
    };
  }

  try {
    if (!liffInitPromise) {
      liffInitPromise = liff.init({ liffId });
    }
    await liffInitPromise;

    const isInClient = liff.isInClient();
    let isLoggedIn = liff.isLoggedIn();

    let lineUserId = null;
    let lineDisplayName = null;
    let linePictureUrl = null;

    if (!isLoggedIn && isInClient) {
      liff.login();
      return { isLiff: true, isLoggedIn: false, lineUserId: null, lineDisplayName: null, linePictureUrl: null, error: null };
    }

    if (isLoggedIn) {
      try {
        const profile = await liff.getProfile();
        lineUserId = profile.userId || null;
        lineDisplayName = profile.displayName || null;
        linePictureUrl = profile.pictureUrl || null;
      } catch (profileErr) {
        console.error('[LIFF] Failed to get profile:', profileErr);
      }
    }

    return {
      isLiff: true,
      isLoggedIn,
      lineUserId,
      lineDisplayName,
      linePictureUrl,
      error: null
    };
  } catch (err) {
    console.error('[LIFF] Initialization error:', err);
    return {
      isLiff: false,
      isLoggedIn: false,
      lineUserId: null,
      lineDisplayName: null,
      linePictureUrl: null,
      error: err.message || 'LIFF init failed'
    };
  }
}
