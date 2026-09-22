import apiClient, { 
  setToken, 
  setRefreshToken, 
  removeTokens, 
  getToken,
  handleApiError 
} from './api';

import { API_ENDPOINTS } from '@/config/api.config';
import { isTokenExpired } from '@/lib/jwt';

export type UserRole = 'student' | 'instructor' | 'admin';

// The user object returned from the backend.
// Kept in exact sync with backend/app/schemas.py's UserResponse — the
// backend has no avatar/bio/created_at/is_active fields, so we don't
// pretend it does here anymore.
export interface UserProfile {
  id: string;
  registrationNumber: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  newsletter: boolean;
}

// ---------------------------
// AUTH REQUEST/RESPONSE TYPES
// ---------------------------
export interface RegisterRequest {
  first_name: string;
  last_name: string;
  registrationNumber: string;
  password: string;
  newsletter?: boolean;
  role?: UserRole;
}

export interface RegisterResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: UserProfile;
}

export interface LoginRequest {
  registrationNumber: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: UserProfile;
}

// All the extra keys other parts of the app stash in localStorage on
// login (see pages/auth/Login.tsx). Logout must clear every one of
// these or a stale value (e.g. user_role) can leak into the next
// unauthenticated render.
const AUX_STORAGE_KEYS = ['user_profile', 'user_role', 'user_id', 'user_name'];

// Fired on the `window` whenever the app forces a logout (manual,
// session-expired, or a 401 that couldn't be refreshed). AuthGuard /
// useSessionTimeout listen for this so every tab & component reacts
// immediately instead of polling localStorage.
export const SESSION_ENDED_EVENT = 'app:session-ended';

// ---------------------------
// AUTH SERVICE CLASS
// ---------------------------
class AuthService {
  private currentUser: UserProfile | null = null;

  // ---------------------------
  // REGISTER USER (NEW)
  // ---------------------------
  async register(data: RegisterRequest): Promise<UserProfile> {
    try {
      const response = await apiClient.post<RegisterResponse>(
        API_ENDPOINTS.auth.register,
        data
      );

      // Save tokens
      setToken(response.data.access_token);
      setRefreshToken(response.data.refresh_token);

      // Cache user
      this.currentUser = response.data.user;
      localStorage.setItem('user_profile', JSON.stringify(this.currentUser));

      return response.data.user;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ---------------------------
  // LOGIN
  // ---------------------------
  async login(data: LoginRequest): Promise<UserProfile> {
    try {
      const response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.auth.login,
        data
      );

      setToken(response.data.access_token);
      setRefreshToken(response.data.refresh_token);

      this.currentUser = response.data.user;
      localStorage.setItem('user_profile', JSON.stringify(this.currentUser));

      return response.data.user;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ---------------------------
  // CURRENT USER
  // ---------------------------
  async getCurrentUser(): Promise<UserProfile> {
    if (this.currentUser) return this.currentUser;

    const cached = localStorage.getItem('user_profile');
    if (cached) {
      this.currentUser = JSON.parse(cached);
      return this.currentUser;
    }

    try {
      const response = await apiClient.get<UserProfile>(API_ENDPOINTS.auth.me);
      this.currentUser = response.data;
      localStorage.setItem('user_profile', JSON.stringify(this.currentUser));
      return response.data;
    } catch (error) {
      removeTokens();
      throw new Error(handleApiError(error));
    }
  }

  /**
   * GET /auth/student/{id}/details — looks up another user's public
   * identity (name + registration number) by id. Used by instructor
   * pages that only have a student_id (e.g. from an enrollment) and
   * need something human-readable to display.
   */
  async getStudentDetails(studentId: string): Promise<UserProfile> {
    try {
      const response = await apiClient.get<UserProfile>(
        API_ENDPOINTS.auth.studentDetails(studentId)
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /** Synchronous, cache-friendly read of the cached user (no network). */
  getCachedUser(): UserProfile | null {
    if (this.currentUser) return this.currentUser;
    const cached = localStorage.getItem('user_profile');
    if (!cached) return null;
    try {
      this.currentUser = JSON.parse(cached);
      return this.currentUser;
    } catch {
      return null;
    }
  }

  /**
   * Always hits the backend (GET /auth/me) instead of trusting the
   * cache. Use this anywhere "real, current backend data" matters —
   * the header's user-details label, a settings/account screen, etc.
   * Updates the cache too, so getCachedUser()/getCurrentUser() pick up
   * the fresh values afterwards.
   */
  async fetchUserDetails(): Promise<UserProfile> {
    try {
      const response = await apiClient.get<UserProfile>(API_ENDPOINTS.auth.me);
      this.currentUser = response.data;
      localStorage.setItem('user_profile', JSON.stringify(this.currentUser));
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ---------------------------
  // LOGOUT
  // ---------------------------
  /**
   * Ends the session everywhere and makes sure the browser's back
   * button can never reveal an authenticated page again.
   *
   * `redirect` defaults to true. We intentionally use a *hard*
   * `window.location.replace` instead of React Router's `navigate()`:
   *   1. It fully unmounts the React app, wiping any in-memory
   *      protected-page state (nothing left for back/forward-cache
   *      to resurrect the "logged in" view from).
   *   2. `.replace()` swaps the current history entry instead of
   *      pushing a new one, so the logged-out user landing on
   *      /auth/login can't hit "forward" back into the app either.
   * AuthGuard's `pageshow` listener is the second line of defense in
   * case a browser still restores an older tab state from bfcache.
   */
  logout(options: { redirect?: boolean; reason?: 'manual' | 'expired' } = {}): void {
    const { redirect = true } = options;

    removeTokens();
    AUX_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    this.currentUser = null;

    window.dispatchEvent(new CustomEvent(SESSION_ENDED_EVENT, { detail: options.reason ?? 'manual' }));

    if (redirect) {
      window.location.replace('/login');
    }
  }

  isAuthenticated(): boolean {
    const token = getToken();
    if (!token) return false;
    // A token that's present but expired is not a valid session.
    return !isTokenExpired(token);
  }

  // ---------------------------
  // REFRESH TOKEN
  // ---------------------------
  async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('No refresh token found');

    try {
      const response = await apiClient.post<{ access_token: string; user: UserProfile }>(
        API_ENDPOINTS.auth.refresh,
        { refresh_token: refreshToken }
      );

      setToken(response.data.access_token);

      if (response.data.user) {
        this.currentUser = response.data.user;
        localStorage.setItem('user_profile', JSON.stringify(this.currentUser));
      }

      return response.data.access_token;
    } catch (error) {
      removeTokens();
      localStorage.removeItem('user_profile');
      this.currentUser = null;
      throw new Error(handleApiError(error));
    }
  }

  // ---------------------------
  // SETTINGS > SECURITY
  // ---------------------------

  /** PUT /auth/change-password — verified server-side against the current password. */
  async changePassword(currentPassword: string, newPassword: string): Promise<string> {
    try {
      const response = await apiClient.put<{ message: string }>(
        API_ENDPOINTS.auth.changePassword,
        { current_password: currentPassword, new_password: newPassword }
      );
      return response.data.message;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * DELETE /auth/me — the backend re-checks the password before
   * deleting the row. Once the backend confirms deletion we end the
   * local session the same way a normal logout does (clears storage,
   * fires SESSION_ENDED_EVENT, hard-redirects to /auth/login so the
   * back button can't reveal the now-deleted account's pages).
   */
  async deleteAccount(password: string): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.auth.deleteAccount, { data: { password } });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
    this.logout({ reason: 'manual' });
  }
}

export const authService = new AuthService();
