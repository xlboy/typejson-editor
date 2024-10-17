import { parse } from 'es-module-lexer/js';
import fs from 'fs';
import path from 'path';
import { transform } from 'sucrase';
import { fileURLToPath } from 'url';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = path.dirname(currentFilePath);
const rawStr = fs.readFileSync(path.join(currentDirPath, './raw.ts'), 'utf-8');
const { code } = transform(rawStr, {
  transforms: ['typescript'],
  production: false,
  jsxRuntime: 'automatic',
});

const [imports] = parse(code);
const res = imports.map(({ s: start, e: end }) => code.slice(start, end));

debugger;
