// @ts-ignore
import { parse } from 'es-module-lexer/js';
import { transform } from 'sucrase';

export function convertToJs(tsCode: string) {
  return transform(tsCode, {
    transforms: ['typescript'],
    production: false,
    jsxRuntime: 'automatic',
  }).code;
}

export function parseImports(jsCode: string) {
  const [imports] = parse(jsCode) as [Array<{ s: number; e: number }>];
  return imports.map(({ s: start, e: end }) => jsCode.slice(start, end)) as string[];
}
