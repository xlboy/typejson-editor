import fs from 'fs';
import path from 'path';
import { parseAsync } from 'rs-module-lexer';

const rawStr = fs.readFileSync(path.resolve(__dirname, './raw.ts'), 'utf-8');

const { output } = await parseAsync({
  input: [
    {
      filename: 'index.ts',
      code: `
        export const member = 5
        import { useState } from 'react'
      `,
    },
    // ... other files
  ],
});

debugger;
