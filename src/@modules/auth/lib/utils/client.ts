'use client';

import { Env } from '.environments';
import { Roles, TPermission } from '@lib/constant';
import { Cookies, getNotificationInstance } from '@lib/utils';
import type { MenuProps, TableColumnsType } from 'antd';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import { AUTH_TOKEN_KEY, PERMISSION_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../constant';
import { IPermissionToken, ISession, ISignInSession, IToken } from '../interfaces';

let sessionCache: ISession = null;
let sessionUserCache: ISession['user'] = null;
/**
 * Calculates cookie expiration from a JWT token's exp claim.
 * Adds 1 minute buffer so the cookie outlives the token,
 * allowing the 401 → refresh flow to trigger.
 */
const getCookieExpirationFromJwt = (jwtToken: string): Date => {
  try {
    const decoded: IToken = jwtDecode(jwtToken);
    if (decoded?.exp) {
      // Expire 1 minute after the JWT expires
      return new Date(decoded.exp * 1000 + 60 * 1000);
    }
  } catch {
    // fallback
  }
  // Fallback: 4 hours from now
  return new Date(new Date().getTime() + 4 * 60 * 60 * 1000);
};

export const unAuthorizeSession: ISession = {
  isLoading: false,
  isAuthenticate: false,
  user: null,
  token: null,
  permissionToken: null,
};

export const getAuthSession = (): ISession => {
  if (typeof window === 'undefined') return { ...unAuthorizeSession, isLoading: true };

  if (sessionCache && !isJwtExpire(sessionCache.token)) return sessionCache;

  try {
    const token = Cookies.getData(AUTH_TOKEN_KEY);
    const permissionToken = Cookies.getData(PERMISSION_TOKEN_KEY);

    if (!token) {
      return unAuthorizeSession;
    } else {
      const tokenDec: IToken = jwtDecode(token);
      const isExpire = isJwtExpire(tokenDec);

      if (isExpire) {
        // Token is expired, try to refresh silently
        // Don't return unAuthorizeSession immediately, let the refresh happen
        refreshAuthToken().catch(() => {
          // If refresh fails, session will be cleared
        });
        return unAuthorizeSession;
      } else {
        const session = {
          isLoading: false,
          isAuthenticate: true,
          user: {
            ...tokenDec.user,
            roles: Array.isArray(tokenDec.user?.roles) ? tokenDec.user.roles : [],
          },
          token,
          permissionToken,
        };

        sessionCache = session;
        sessionUserCache = session.user;
        return session;
      }
    }
  } catch {
    return unAuthorizeSession;
  }
};

export const setAuthSession = (session: ISignInSession): ISession => {
  if (typeof window === 'undefined') return { ...unAuthorizeSession, isLoading: true };

  try {
    const token = session.accessToken;
    const permissionToken = session.permissionToken;

    if (!token) {
      return unAuthorizeSession;
    } else {
      const tokenDec: IToken = jwtDecode(token);
      
      // Set cookie expiration based on JWT exp claim (with 1 min buffer)
      const cookieExpiration = getCookieExpirationFromJwt(token);
      // Refresh token gets longer expiration matching its JWT exp
      const refreshTokenExpiration = getCookieExpirationFromJwt(session.refreshToken);

      sessionCache = null;
      sessionUserCache = null;
      Cookies.setData(AUTH_TOKEN_KEY, token, cookieExpiration);
      Cookies.setData(PERMISSION_TOKEN_KEY, session.permissionToken, cookieExpiration);
      Cookies.setData(REFRESH_TOKEN_KEY, session.refreshToken, refreshTokenExpiration);      return {
          isLoading: false,
          isAuthenticate: true,
          user: {
            ...tokenDec.user,
            roles: Array.isArray(tokenDec.user?.roles) ? tokenDec.user.roles : [],
          },
          token,
          permissionToken,
        };
    }
  } catch {
    return unAuthorizeSession;
  }
};

export const clearAuthSession = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {      Cookies.removeData(AUTH_TOKEN_KEY);
      Cookies.removeData(PERMISSION_TOKEN_KEY);
      Cookies.removeData(REFRESH_TOKEN_KEY);
    return true;
  } catch {
    return false;
  }
};

export const useAuthSession = (): ISession => {
  const [session, setSession] = useState<ISession>({ ...unAuthorizeSession, isLoading: true });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Only set session once on mount
    const currentSession = getAuthSession();
    setSession(currentSession);
  }, []);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return { ...unAuthorizeSession, isLoading: true };
  }

  return session;
};

export const getAuthToken = (): string => {
  if (typeof window === 'undefined') return null;

  try {
    const token = Cookies.getData(AUTH_TOKEN_KEY);
    return token;
  } catch {
    return null;
  }
};

export const getRefreshToken = (): string => {
  if (typeof window === 'undefined') return null;

  try {
    const token = Cookies.getData(REFRESH_TOKEN_KEY);
    return token;
  } catch {
    return null;
  }
};

let refreshPromise: Promise<boolean> | null = null;
let isRefreshing = false;

export const refreshAuthToken = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  // Prevent multiple concurrent refresh attempts
  if (refreshPromise) return refreshPromise;
  
  // Prevent refresh if already in progress
  if (isRefreshing) return false;

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        console.warn('No refresh token available');
        return false;
      }

      // Check if refresh token is expired
      try {
        const decoded: IToken = jwtDecode(refreshToken);
        if (isJwtExpire(decoded)) {
          console.warn('Refresh token is expired');
          clearAuthSession();
          return false;
        }
      } catch {
        console.warn('Invalid refresh token');
        clearAuthSession();
        return false;
      }

      const { default: axios } = await import('axios');
      const { Env } = await import('.environments');
      
      const response = await axios.post(`${Env.apiUrl}/auth/refresh-token`, {
        refreshToken,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data?.success) {
        const { accessToken, permissionToken, refreshToken: newRefreshToken } = response.data.data;
        
        // Validate new tokens
        if (!accessToken || !newRefreshToken) {
          console.warn('Invalid token response from server');
          return false;
        }

        const cookieExpiration = getCookieExpirationFromJwt(accessToken);
        const refreshTokenExpiration = getCookieExpirationFromJwt(newRefreshToken);

        sessionCache = null;
        sessionUserCache = null;
        Cookies.setData(AUTH_TOKEN_KEY, accessToken, cookieExpiration);
        Cookies.setData(PERMISSION_TOKEN_KEY, permissionToken, cookieExpiration);
        Cookies.setData(REFRESH_TOKEN_KEY, newRefreshToken, refreshTokenExpiration);

        console.info('Token refreshed successfully');
        return true;
      }
      console.warn('Token refresh failed: invalid response');
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      // Clear tokens on any error during refresh
      clearAuthSession();
      return false;
    } finally {
      refreshPromise = null;
      isRefreshing = false;
    }
  })();

  return refreshPromise;
};

export const getPermissionToken = (): string => {
  if (typeof window === 'undefined') return null;

  try {
    const token = Cookies.getData(PERMISSION_TOKEN_KEY);
    return token;
  } catch {
    return null;
  }
};

export const isJwtExpire = (token: string | IToken): boolean => {
  let holdToken = null;

  if (typeof token === 'string') holdToken = jwtDecode(token);
  else holdToken = token;

  if (!holdToken?.exp) return true;
  else {
    const expDate: Date = new Date(holdToken.exp * 1000);

    if (expDate > new Date()) return false;
    else return true;
  }
};

export const getPermissions = (): TPermission[] => {
  try {
    const token = getPermissionToken();

    if (token) {
      const tokenDec: IPermissionToken = jwtDecode(token);

      return tokenDec?.permissions ?? [];
    } else {
      return [];
    }
  } catch {
    return [];
  }
};

/** Case-insensitive match against the backend role titles/ids in the session */
const userHasRole = (roleTitle: string): boolean => {
  const roles = sessionUserCache?.roles ?? [];

  return roles.some((r) => String(r).toLowerCase() === roleTitle.toLowerCase());
};

export const hasAccessPermission = (allowedAccess: TPermission[]): boolean => {
  if (Env.isEnableRBAC === 'false') return true;
  else if (userHasRole(Roles.SUPER_ADMIN)) return true;
  else if (userHasRole(Roles.ADMIN)) return true;
  else {
    const permissions: TPermission[] = [...getPermissions(), 'FORBIDDEN'];
    const hasAccess = permissions.some((permission) => allowedAccess.includes(permission));

    return hasAccess;
  }
};

export const getAccess = (allowedAccess: TPermission[], func: () => void, message = 'Unauthorized Access!') => {
  const notification = getNotificationInstance();
  const hasAccess: boolean = hasAccessPermission(allowedAccess);

  return hasAccess ? func() : notification.error({ message });
};

interface IGetContentAccess<Record> {
  allowedAccess: TPermission[];
  content: Record;
}

export const getContentAccess = <Record = any>({ allowedAccess, content }: IGetContentAccess<Record>): Record => {
  const hasAccess: boolean = hasAccessPermission(allowedAccess);

  return hasAccess ? content : null;
};

interface IGetColumnsAccess<Record> {
  allowedAccess: TPermission[];
  columns: TableColumnsType<Record>;
}

export const getColumnsAccess = <Record = any>({
  allowedAccess,
  columns,
}: IGetColumnsAccess<Record>): TableColumnsType<Record> => {
  const hasAccess: boolean = hasAccessPermission(allowedAccess);

  return hasAccess ? columns : [];
};

type TMenuItem = Required<MenuProps>['items'][number];
export type TMenuItems = TMenuItem & {
  allowedAccess?: TPermission[];
  children?: TMenuItems[];
};

export const getMenuItemsAccess = (menuItems: TMenuItems[]): TMenuItem[] => {
  const items = menuItems.map((item) => {
    const hasAccess = item?.allowedAccess ? hasAccessPermission(item.allowedAccess) : true;

    if (hasAccess) {
      const children = item.children ? getMenuItemsAccess(item.children) : null;
      delete item.allowedAccess;

      return { ...item, children };
    } else {
      return null;
    }
  });

  return items.filter((x) => x);
};

export const hasAccessByRoles = (allowedRoles: string[], disallowedRoles: string[]): boolean => {
  if (Env.isEnableRBAC === 'false') return true;
  else if (userHasRole(Roles.SUPER_ADMIN)) return true;
  else if (userHasRole(Roles.ADMIN)) return true;
  else {
    const roles = sessionUserCache?.roles ?? [];
    let hasAccess = false;

    if (allowedRoles.length) hasAccess = roles.some((role) => userHasRole(role));
    if (disallowedRoles.length) hasAccess = roles.some((role) => !userHasRole(role));

    return hasAccess;
  }
};

interface IGetNodeByRoles {
  node: React.ReactNode;
  allowedRoles?: string[];
  disallowedRoles?: string[];
  fallBack?: React.ReactNode;
}

export const getNodeByRoles = ({
  node,
  allowedRoles = [],
  disallowedRoles = [],
  fallBack = null,
}: IGetNodeByRoles): React.ReactNode => {
  const hasAccess: boolean = hasAccessByRoles(allowedRoles, disallowedRoles);

  return hasAccess ? node : fallBack || null;
};

interface IGetColumnsByRoles<Record> {
  columns: TableColumnsType<Record>;
  allowedRoles?: string[];
  disallowedRoles?: string[];
}

export const getColumnsByRoles = <Record = any>({
  columns,
  allowedRoles = [],
  disallowedRoles = [],
}: IGetColumnsByRoles<Record>): TableColumnsType<Record> => {
  const hasAccess: boolean = hasAccessByRoles(allowedRoles, disallowedRoles);

  return hasAccess ? columns : [];
};

interface IGetContentByRoles<Record> {
  content: Record;
  allowedRoles?: string[];
  disallowedRoles?: string[];
}

export const getContentByRoles = <Record = any>({
  content,
  allowedRoles = [],
  disallowedRoles = [],
}: IGetContentByRoles<Record>): Record => {
  const hasAccess: boolean = hasAccessByRoles(allowedRoles, disallowedRoles);

  return hasAccess ? content : null;
};
