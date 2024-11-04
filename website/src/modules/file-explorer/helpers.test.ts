import { buildFileTree } from './helpers';
import type { OriginFile } from './types';
import { describe, expect, it } from 'vitest';

describe('buildFileTree', () => {
  it('should handle empty input', () => {
    expect(buildFileTree([])).toEqual([]);
  });

  it('should build a simple file tree with correct sorting', () => {
    const files: OriginFile[] = [
      {
        name: 'Button.tsx',
        fullPath: '/src/components/common/Button.tsx',
        dirPath: '/src/components/common',
        readOnly: false,
      },
      {
        name: 'Input.tsx',
        fullPath: '/src/components/Input.tsx',
        dirPath: '/src/components',
        readOnly: false,
      },
      {
        name: 'index.tsx',
        fullPath: '/src/components/index.tsx',
        dirPath: '/src/components',
        readOnly: false,
      },
    ];

    const result = buildFileTree(files);

    expect(result).toEqual([
      {
        type: 'directory',
        name: 'src',
        id: '/src/components',
        dirPath: '/src/components',
        children: [
          {
            type: 'directory',
            name: 'components',
            id: '/src/components',
            dirPath: '/src/components',
            children: [
              {
                type: 'directory',
                name: 'common',
                id: '/src/components/common',
                dirPath: '/src/components/common',
                children: [
                  {
                    type: 'file',
                    origin: {
                      name: 'Button.tsx',
                      fullPath: '/src/components/common/Button.tsx',
                      dirPath: '/src/components/common',
                      readOnly: false,
                    },
                    id: '/src/components/common/Button.tsx',
                  },
                ],
              },
              {
                type: 'file',
                origin: {
                  name: 'index.tsx',
                  fullPath: '/src/components/index.tsx',
                  dirPath: '/src/components',
                  readOnly: false,
                },
                id: '/src/components/index.tsx',
              },
              {
                type: 'file',
                origin: {
                  name: 'Input.tsx',
                  fullPath: '/src/components/Input.tsx',
                  dirPath: '/src/components',
                  readOnly: false,
                },
                id: '/src/components/Input.tsx',
              },
            ],
          },
        ],
      },
    ]);
  });

  it('should handle complex nested structure', () => {
    const files: OriginFile[] = [
      {
        name: 'index.ts',
        fullPath: '/src/utils/index.ts',
        dirPath: '/src/utils',
        readOnly: false,
      },
      {
        name: 'App.tsx',
        fullPath: '/src/App.tsx',
        dirPath: '/src',
        readOnly: false,
      },
      {
        name: 'README.md',
        fullPath: '/README.md',
        dirPath: '/',
        readOnly: true,
      },
    ];

    const result = buildFileTree(files);

    expect(result).toEqual([
      {
        type: 'directory',
        name: 'src',
        id: '/src',
        dirPath: '/src',
        children: [
          {
            type: 'directory',
            name: 'utils',
            id: '/src/utils',
            dirPath: '/src/utils',
            children: [
              {
                type: 'file',
                origin: {
                  name: 'index.ts',
                  fullPath: '/src/utils/index.ts',
                  dirPath: '/src/utils',
                  readOnly: false,
                },
                id: '/src/utils/index.ts',
              },
            ],
          },
          {
            type: 'file',
            origin: {
              name: 'App.tsx',
              fullPath: '/src/App.tsx',
              dirPath: '/src',
              readOnly: false,
            },
            id: '/src/App.tsx',
          },
        ],
      },
      {
        type: 'file',
        origin: {
          name: 'README.md',
          fullPath: '/README.md',
          dirPath: '/',
          readOnly: true,
        },
        id: '/README.md',
      },
    ]);
  });

  it('should handle files with same names in different directories', () => {
    const files: OriginFile[] = [
      {
        name: 'index.ts',
        fullPath: '/src/components/index.ts',
        dirPath: '/src/components',
        readOnly: false,
      },
      {
        name: 'index.ts',
        fullPath: '/src/utils/index.ts',
        dirPath: '/src/utils',
        readOnly: false,
      },
    ];

    const result = buildFileTree(files);

    expect(result).toEqual([
      {
        type: 'directory',
        name: 'src',
        id: '/src/components',
        dirPath: '/src/components',
        children: [
          {
            type: 'directory',
            name: 'components',
            id: '/src/components',
            dirPath: '/src/components',
            children: [
              {
                type: 'file',
                origin: {
                  name: 'index.ts',
                  fullPath: '/src/components/index.ts',
                  dirPath: '/src/components',
                  readOnly: false,
                },
                id: '/src/components/index.ts',
              },
            ],
          },
          {
            type: 'directory',
            name: 'utils',
            id: '/src/utils',
            dirPath: '/src/utils',
            children: [
              {
                type: 'file',
                origin: {
                  name: 'index.ts',
                  fullPath: '/src/utils/index.ts',
                  dirPath: '/src/utils',
                  readOnly: false,
                },
                id: '/src/utils/index.ts',
              },
            ],
          },
        ],
      },
    ]);
  });

  it('should maintain correct sorting order', () => {
    const files: OriginFile[] = [
      {
        name: 'zebra.ts',
        fullPath: '/src/zebra.ts',
        dirPath: '/src',
        readOnly: false,
      },
      {
        name: 'index.ts',
        fullPath: '/src/utils/index.ts',
        dirPath: '/src/utils',
        readOnly: false,
      },
      {
        name: 'banana.ts',
        fullPath: '/src/banana.ts',
        dirPath: '/src',
        readOnly: false,
      },
      {
        name: 'apple.ts',
        fullPath: '/src/apple.ts',
        dirPath: '/src',
        readOnly: false,
      },
      {
        name: 'config.ts',
        fullPath: '/src/utils/config.ts',
        dirPath: '/src/utils',
        readOnly: false,
      },
    ];

    const result = buildFileTree(files);

    expect(result).toEqual([
      {
        type: 'directory',
        name: 'src',
        id: '/src',
        dirPath: '/src',
        children: [
          {
            type: 'directory',
            name: 'utils',
            id: '/src/utils',
            dirPath: '/src/utils',
            children: [
              {
                type: 'file',
                origin: {
                  name: 'config.ts',
                  fullPath: '/src/utils/config.ts',
                  dirPath: '/src/utils',
                  readOnly: false,
                },
                id: '/src/utils/config.ts',
              },
              {
                type: 'file',
                origin: {
                  name: 'index.ts',
                  fullPath: '/src/utils/index.ts',
                  dirPath: '/src/utils',
                  readOnly: false,
                },
                id: '/src/utils/index.ts',
              },
            ],
          },
          {
            type: 'file',
            origin: {
              name: 'apple.ts',
              fullPath: '/src/apple.ts',
              dirPath: '/src',
              readOnly: false,
            },
            id: '/src/apple.ts',
          },
          {
            type: 'file',
            origin: {
              name: 'banana.ts',
              fullPath: '/src/banana.ts',
              dirPath: '/src',
              readOnly: false,
            },
            id: '/src/banana.ts',
          },
          {
            type: 'file',
            origin: {
              name: 'zebra.ts',
              fullPath: '/src/zebra.ts',
              dirPath: '/src',
              readOnly: false,
            },
            id: '/src/zebra.ts',
          },
        ],
      },
    ]);
  });
});
