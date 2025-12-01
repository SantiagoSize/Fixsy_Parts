const DEFAULT_USERS_API = 'http://localhost:8081';
const DEFAULT_PRODUCTS_API = 'http://localhost:8083';
const DEFAULT_ORDERS_API = 'http://localhost:8084';
const DEFAULT_MESSAGES_API = 'http://localhost:8085';

export const USERS_API_BASE = import.meta.env.VITE_USERS_API || DEFAULT_USERS_API;
export const PRODUCTS_API_BASE = import.meta.env.VITE_PRODUCTS_API || DEFAULT_PRODUCTS_API;
export const ORDERS_API_BASE = import.meta.env.VITE_ORDERS_API || DEFAULT_ORDERS_API;
export const MESSAGES_API_BASE = import.meta.env.VITE_MESSAGES_API || DEFAULT_MESSAGES_API;

export type ApiErrorResponse = { message?: string; error?: string; errors?: string[]; details?: string };

export type ApiSuccess<T> = { ok: true; status: number; data: T };
export type ApiFailure = { ok: false; status?: number; error: string };
export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

type ApiFetchOptions = RequestInit & { json?: unknown; asResult?: boolean };

function trimSlash(value: string) {
  return value.replace(/\/+$/, '');
}

export function buildApiUrl(baseUrl: string, path = '') {
  const safeBase = trimSlash(baseUrl || '');
  const safePath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  return `${safeBase}${safePath}`;
}

export function buildUserAvatarUrl(userId: string, cacheBust?: number | string) {
  const suffix = cacheBust ? `?t=${cacheBust}` : '';
  return buildApiUrl(USERS_API_BASE, `/api/users/${userId}/avatar${suffix}`);
}

/**
 * Construye la URL completa para una imagen de producto
 * Si la imagen ya es una URL completa, la devuelve tal cual
 * Si es una ruta relativa como /images/file.jpg, le agrega el host del microservicio
 */
export function buildProductImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return '';
  
  // Si ya es una URL completa, devolverla tal cual
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Extraer el nombre del archivo si viene con /images/
  let fileName = imagePath;
  if (imagePath.startsWith('/images/')) {
    fileName = imagePath.replace('/images/', '');
  } else if (imagePath.startsWith('images/')) {
    fileName = imagePath.replace('images/', '');
  }
  
  // Construir la URL completa usando el endpoint /images/{fileName}
  return `${PRODUCTS_API_BASE}/images/${fileName}`;
}

export async function parseErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as ApiErrorResponse;
    if (Array.isArray(data?.errors) && data.errors.length > 0) return data.errors.join(' | ');
    return data.message || data.error || data.details || null;
  } catch {
    return null;
  }
}

/**
 * Wrapper para fetch con JSON y manejo de errores unificado.
 * Compatible con llamadas antiguas (url completo) y nuevo formato base+path.
 * Por defecto lanza Error en fallos; si `asResult` es true, devuelve ApiResult.
 */
export function apiFetch<T>(url: string, options?: ApiFetchOptions & { asResult?: false }): Promise<T>;
export function apiFetch<T>(baseUrl: string, path: string, options?: ApiFetchOptions & { asResult?: false }): Promise<T>;
export function apiFetch<T>(url: string, options: ApiFetchOptions & { asResult: true }): Promise<ApiResult<T>>;
export function apiFetch<T>(baseUrl: string, path: string, options: ApiFetchOptions & { asResult: true }): Promise<ApiResult<T>>;
export async function apiFetch<T>(
  baseUrl: string,
  pathOrOptions?: string | ApiFetchOptions,
  maybeOptions?: ApiFetchOptions
): Promise<T | ApiResult<T>> {
  const hasPath = typeof pathOrOptions === 'string';
  const path = hasPath ? (pathOrOptions as string) : '';
  const opts = (hasPath ? maybeOptions : (pathOrOptions as ApiFetchOptions)) || {};
  const asResult = opts.asResult === true;
  const { json, headers, ...rest } = opts;
  const url = hasPath ? buildApiUrl(baseUrl, path) : baseUrl;

  const mergedHeaders = new Headers(headers || {});
  if (json !== undefined && !mergedHeaders.has('Content-Type')) {
    mergedHeaders.set('Content-Type', 'application/json');
  }
  if (!mergedHeaders.has('Accept')) mergedHeaders.set('Accept', 'application/json');

  const init: RequestInit = {
    ...rest,
    headers: mergedHeaders,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  };

  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (err: any) {
    const fallback = 'No se pudo conectar con el servidor. Intenta nuevamente.';
    if (asResult) return { ok: false, error: fallback };
    throw new Error(err?.message || fallback);
  }

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    const errorMsg = message || `Error al llamar al servicio (${response.status})`;
    if (asResult) return { ok: false, status: response.status, error: errorMsg };
    throw new Error(errorMsg);
  }

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  const success: ApiSuccess<T> = { ok: true, status: response.status, data: payload as T };
  return asResult ? success : (payload as T);
}
