import type { HashError } from './types';

export function toHashError(code: string, message: string, cause?: unknown): HashError {
  return { ok: false, code, message, cause };
}
