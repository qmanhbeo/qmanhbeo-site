export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api/paths-untold';
export const LLM_MODEL = process.env.NEXT_PUBLIC_LLM_MODEL || 'gpt-4o-mini';
export const IS_DEV = process.env.NODE_ENV === 'development';
export const TERMINAL_DEBUG_LOGS = process.env.NEXT_PUBLIC_TERMINAL_DEBUG_LOGS === 'true';

export function publicAsset(path) {
  return `/paths-untold/${String(path).replace(/^\/+/, '')}`;
}
