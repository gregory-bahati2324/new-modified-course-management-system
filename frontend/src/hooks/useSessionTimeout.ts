import { useCallback, useEffect, useRef, useState } from 'react';
import { authService, SESSION_ENDED_EVENT } from '@/services/authService';
import { getToken } from '@/services/api';
import { getTokenExpiryMs } from '@/lib/jwt';

/** How long before expiry we start warning the user (in seconds). */
const WARNING_BEFORE_EXPIRY_SECONDS = 60;

/** How often we recompute the countdown while the warning is showing. */
const TICK_MS = 1000;

interface SessionTimeoutState {
  /** True while the "your session is about to expire" dialog should show. */
  showWarning: boolean;
  /** Seconds left until forced logout (only meaningful while showWarning is true). */
  secondsRemaining: number;
  /** Call when the user clicks "Stay logged in". Refreshes the token and resets timers. */
  stayLoggedIn: () => Promise<void>;
  /** Call when the user clicks "Log out now" (or to force an immediate logout). */
  logoutNow: () => void;
}

/**
 * Mount this once near the root of the authenticated app.
 * It reads the "exp" claim already embedded in the JWT access token
 * (set by the backend's ACCESS_TOKEN_EXPIRE_MINUTES) and:
 *   1. Shows a warning WARNING_BEFORE_EXPIRY_SECONDS before it expires.
 *   2. Automatically logs the user out the moment it does expire,
 *      via authService.logout() — which also makes sure the browser
 *      back button can't reveal the app again afterwards.
 */
export function useSessionTimeout(): SessionTimeoutState {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  const warningTimer = useRef<ReturnType<typeof setTimeout>>();
  const logoutTimer = useRef<ReturnType<typeof setTimeout>>();
  const tickInterval = useRef<ReturnType<typeof setInterval>>();

  const clearAllTimers = () => {
    clearTimeout(warningTimer.current);
    clearTimeout(logoutTimer.current);
    clearInterval(tickInterval.current);
  };

  const logoutNow = useCallback(() => {
    clearAllTimers();
    setShowWarning(false);
    authService.logout({ reason: 'expired' });
  }, []);

  const scheduleFromToken = useCallback(() => {
    clearAllTimers();
    setShowWarning(false);

    const token = getToken();
    const expiryMs = getTokenExpiryMs(token);
    if (!token || expiryMs === null) return; // not logged in — nothing to schedule

    const msUntilExpiry = expiryMs - Date.now();
    const msUntilWarning = msUntilExpiry - WARNING_BEFORE_EXPIRY_SECONDS * 1000;

    if (msUntilExpiry <= 0) {
      // Token is already expired (e.g. laptop was asleep).
      logoutNow();
      return;
    }

    // Auto-logout the instant the token actually expires, warning or not.
    logoutTimer.current = setTimeout(logoutNow, msUntilExpiry);

    if (msUntilWarning <= 0) {
      // Less than the warning window remains right now — show it immediately.
      setSecondsRemaining(Math.ceil(msUntilExpiry / 1000));
      setShowWarning(true);
      tickInterval.current = setInterval(() => {
        setSecondsRemaining((prev) => Math.max(prev - 1, 0));
      }, TICK_MS);
    } else {
      warningTimer.current = setTimeout(() => {
        const remainingMs = getTokenExpiryMs(getToken()) ? getTokenExpiryMs(getToken())! - Date.now() : 0;
        setSecondsRemaining(Math.max(Math.ceil(remainingMs / 1000), 0));
        setShowWarning(true);
        tickInterval.current = setInterval(() => {
          setSecondsRemaining((prev) => Math.max(prev - 1, 0));
        }, TICK_MS);
      }, msUntilWarning);
    }
  }, [logoutNow]);

  const stayLoggedIn = useCallback(async () => {
    try {
      await authService.refreshToken();
      scheduleFromToken(); // new token → new exp → reschedule everything
    } catch {
      // Refresh token is dead too — nothing left to do but log out.
      logoutNow();
    }
  }, [scheduleFromToken, logoutNow]);

  useEffect(() => {
    scheduleFromToken();

    // Re-schedule whenever a token is refreshed/replaced in another
    // part of the app (e.g. a normal API call triggered a silent
    // refresh), and stop everything the moment a logout happens.
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'auth_token') scheduleFromToken();
    };
    const onSessionEnded = () => {
      clearAllTimers();
      setShowWarning(false);
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener(SESSION_ENDED_EVENT, onSessionEnded);

    return () => {
      clearAllTimers();
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(SESSION_ENDED_EVENT, onSessionEnded);
    };
  }, [scheduleFromToken]);

  return { showWarning, secondsRemaining, stayLoggedIn, logoutNow };
}