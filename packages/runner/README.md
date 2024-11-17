# TypeJsonRunner

TypeJsonRunner 是一个基于浏览器端的 TypeScript 代码运行工具。

## 简介

本工具基于 [nodebox-runtime](https://github.com/Sandpack/nodebox-runtime) 构建，让你能够直接在浏览器中执行 TypeScript 代码，无需后端服务器支持。TypeJsonRunner 会自动分析和收集代码中的依赖关系，无需手动管理依赖项，让开发者可以专注于代码本身。

## 安装

```bash
npm install @typejson-editor/runner
pnpm install @typejson-editor/runner
yarn add @typejson-editor/runner
```

## 使用

```typescript
import { TypeJsonRunner } from '@typejson-editor/runner';

const runner = new TypeJsonRunner();

runner
  .init()
  .then(async () => {
    const runResult = await runner.run({
      files: [
        {
          // 注意：必须包含有 `index.ts` 文件，这是 Runner 执行的入口文件
          files: [
            {
              path: '/index.ts',
              content: `
                import { add } from './utils'
                export default add(1, 2);
              `,
            },
            {
              path: '/utils.ts',
              content: `
                export function add(a: number, b: number) {
                  return a + b
                }`,
            },
          ],
        },
      ],
    });
    console.log(runResult); // output: 3
  })
  .catch(console.error);
```
