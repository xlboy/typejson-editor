import type { NormalizedPath, TypeJsonFile } from './types';

export function normalizePath(path: TypeJsonFile['path']): NormalizedPath {
  return path.trim().replace(/^(\.*\/+)?/, '/');
}
