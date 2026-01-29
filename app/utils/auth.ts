export interface User {
  id: number;
  fullName: string;
  username: string;
  createdAt: string;
  updatedAt: string;
  role: "teacher" | "admin" | "student";
}

export interface AuthData {
  access_token: string;
  expiresAt: string;
  user: User;
}

const AUTH_STORAGE_KEY = "auth_data";
const REMEMBER_ME_KEY = "remember_me";

/**
 * Save auth data to storage
 */
export function saveAuthData(authData: AuthData, rememberMe: boolean): void {
  if (typeof window === "undefined") return;

  // Save remember_me preference to localStorage (persists)
  localStorage.setItem(REMEMBER_ME_KEY, rememberMe.toString());

  // Save auth data to appropriate storage
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
}

/**
 * Get auth data from storage
 */
export function getAuthData(): AuthData | null {
  if (typeof window === "undefined") return null;

  // Check localStorage first (for remember_me users)
  let authDataStr = localStorage.getItem(AUTH_STORAGE_KEY);

  // If not in localStorage, check sessionStorage
  if (!authDataStr) {
    authDataStr = sessionStorage.getItem(AUTH_STORAGE_KEY);
  }

  if (!authDataStr) return null;

  try {
    return JSON.parse(authDataStr) as AuthData;
  } catch {
    return null;
  }
}

/**
 * Get access token from storage
 */
export function getAccessToken(): string | null {
  const authData = getAuthData();
  return authData?.access_token || null;
}

/**
 * Get current user from storage
 */
export function getCurrentUser(): User | null {
  const authData = getAuthData();
  return authData?.user || null;
}

/**
 * Check if token is expired
 */
export function isTokenExpired(): boolean {
  const authData = getAuthData();
  if (!authData?.expiresAt) return true;

  const expiresAt = new Date(authData.expiresAt);
  const now = new Date();

  return now >= expiresAt;
}

/**
 * Check if user is authenticated (has valid token)
 */
export function isAuthenticated(): boolean {
  const authData = getAuthData();
  if (!authData?.access_token) return false;

  return !isTokenExpired();
}

/**
 * Clear auth data from all storages
 */
export function clearAuthData(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(REMEMBER_ME_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

/**
 * Logout user (sync - just clears local storage)
 */
export function logout(): void {
  clearAuthData();
}

/**
 * Logout user with backend API call
 */
export async function logoutAsync(): Promise<boolean> {
  try {
    const authHeader = getAuthHeader();

    // Only call API if we have a token
    if ("Authorization" in authHeader) {
      const response = await fetch(`/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Logout API error:", data.message);
      }
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Always clear local storage regardless of API result
    clearAuthData();
  }

  return true;
}

/**
 * Check if user has required role
 */
export function hasRole(requiredRoles: User["role"][]): boolean {
  const user = getCurrentUser();
  if (!user) return false;

  return requiredRoles.includes(user.role);
}

/**
 * Get authorization header
 */
export function getAuthHeader(): { Authorization: string } | Record<string, never> {
  const token = getAccessToken();
  if (!token) return {};

  return { Authorization: `Bearer ${token}` };
}
