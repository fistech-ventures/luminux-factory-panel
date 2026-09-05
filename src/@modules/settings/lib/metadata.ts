import { ISettingsResponse } from './interfaces';
import { AUTH_TOKEN_KEY } from '@modules/auth/lib/constant';
import { Env } from '.environments';
import { ENUM_API_SCOPE_TYPES } from '@lib/interfaces/apiScope.interface';
import { cookies } from 'next/headers';

const SETTINGS_ENDPOINT = '/global-configs/system';

const internalApiBaseUrlFn = (): string | null => {
  if (!Env.apiUrl) return null;
  const base = Env.apiUrl.replace('{{scope}}', ENUM_API_SCOPE_TYPES.INTERNAL);
  return base.replace(/\/$/, '');
};

const authHeaderFromCookiesFn = async (): Promise<string | undefined> => {
  const identifier = Env.webIdentifier;
  if (!identifier) return undefined;

  const cookieStore = await cookies();
  const raw = cookieStore.get(`${identifier}_${AUTH_TOKEN_KEY}`)?.value;
  if (!raw) return undefined;

  try {
    const token = JSON.parse(raw) as string;
    return typeof token === 'string' ? `Bearer ${token}` : undefined;
  } catch {
    return undefined;
  }
};

export const fetchSettingsForMetadataFn = async (): Promise<ISettingsResponse['data'] | null> => {
  const base = internalApiBaseUrlFn();
  if (!base) return null;

  const authorization = await authHeaderFromCookiesFn();
  const headers: HeadersInit = {
    'Time-Zone-Offset': String(-new Date().getTimezoneOffset()),
  };
  if (authorization) headers['Authorization'] = authorization;

  try {
    const res = await fetch(`${base}${SETTINGS_ENDPOINT}`, {
      headers,
      cache: 'no-store',
    });
    if (!res.ok) return null;

    const body = (await res.json()) as ISettingsResponse;
    if (!body?.success || !body.data) return null;

    return body.data;
  } catch {
    return null;
  }
};

/**
 * Same fetch as metadata. Do **not** wrap with React `cache()` — this call uses `cookies()` and must stay uncached at that layer.
 * (Next.js will error if dynamic request APIs run inside `cache()`.)
 */
export const getCachedQuickSettingsFn = fetchSettingsForMetadataFn;
