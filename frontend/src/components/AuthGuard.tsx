import { ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService, SESSION_ENDED_EVENT } from '@/services/authService';

/**
 * Routes that render without being logged in.
 * Everything NOT listed here is treated as protected — the safe
 * default for an LMS is "deny unless explicitly public".
 * Add any other public marketing/browse routes here if needed.
 */
const PUBLIC_PATHS = ['/', '/login', '/register', '/admin/login'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || (p !== '/' && pathname.startsWith(p + '/'))
  );
}

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * Wrap <Routes> with this once in App.tsx.
 *
 * Why this fixes "back button after logout shows the old page":
 *  - Every route change (including ones caused by the browser's
 *    back/forward buttons, which React Router surfaces as a normal
 *    location change) re-runs this check. No token / expired token
 *    on a protected path -> immediate redirect to /auth/login.
 *  - `pageshow` covers the trickier case where the browser restores
 *    an entire previous page instance from the back-forward cache
 *    (bfcache) after a hard navigation (e.g. the axios interceptor's
 *    redirect on a failed refresh). That restore doesn't always
 *    re-run route matching, so we double-check auth explicitly.
 *  - The `SESSION_ENDED_EVENT` listener reacts instantly to logout
 *    happening anywhere in the app (menu click, session-timeout
 *    auto-logout, or a failed silent refresh) even if the location
 *    hasn't changed yet.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const enforce = () => {
    if (isPublicPath(location.pathname)) return;

    if (!authService.isAuthenticated()) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
    }
  };

  // Re-check on every navigation, including browser back/forward.
  useEffect(() => {
    enforce();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Re-check when a page is restored from bfcache, and when logout
  // fires anywhere in the app.
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) enforce();
    };
    const onSessionEnded = () => enforce();

    window.addEventListener('pageshow', onPageShow);
    window.addEventListener(SESSION_ENDED_EVENT, onSessionEnded);

    return () => {
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener(SESSION_ENDED_EVENT, onSessionEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return <>{children}</>;
}
