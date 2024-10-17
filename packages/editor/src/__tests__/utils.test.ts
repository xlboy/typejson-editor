import { normalizePath } from '../utils';
import { expect, test } from 'vitest';

test('normalizePath', () => {
  expect(normalizePath('./file.ts')).toBe('/file.ts');
  expect(normalizePath('./src/file.ts')).toBe('/src/file.ts');

  expect(normalizePath('/file.ts')).toBe('/file.ts');
  expect(normalizePath('/src/file.ts')).toBe('/src/file.ts');

  expect(normalizePath('file.ts')).toBe('/file.ts');
  expect(normalizePath('src/file.ts')).toBe('/src/file.ts');

  expect(normalizePath('.file.ts')).toBe('/.file.ts');
  expect(normalizePath('../file.ts')).toBe('/../file.ts');
  expect(normalizePath('...file.ts')).toBe('/...file.ts');
  expect(normalizePath('.//..file.ts')).toBe('/..file.ts');
});
