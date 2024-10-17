import type * as Monaco from 'monaco-editor';
import { useEffect, useRef } from 'react';
import type { IRegister, VimMode } from 'vim-monaco';

/// <reference types="requirejs" />

/**
 * See https://github.com/PollRobots/sdf_tool/blame/5410ce7ed75a05fd8ae150558fb65b4c1021d398/src/components/dsl-editor.tsx#L275
 */
class ClipboardRegister implements IRegister {
  linewise: boolean = false;
  blockwise: boolean = false;
  private buffer: string[] = [];

  constructor() {}

  setText(text: string, linewise?: boolean, blockwise?: boolean): void {
    this.linewise = !!linewise;
    this.blockwise = !!blockwise;
    this.buffer = [text];
    navigator.clipboard.writeText(text);
  }
  pushText(text: string, linewise?: boolean): void {
    if (linewise) {
      if (!this.linewise) {
        this.buffer.push('\n');
      }
      this.linewise = linewise;
    }
    this.buffer.push(text);
    navigator.clipboard.writeText(this.buffer.join(''));
  }

  clear(): void {
    this.buffer = [];
    this.linewise = false;
    this.blockwise = false;
  }

  toString() {
    return this.buffer.join('');
  }

  poke() {
    navigator.clipboard.readText().then(text => {
      if (text.includes('\n')) {
        const lines = text.split('\n');
        const blockwise = lines.every(line => line.length === lines[0].length);
        this.setText(text, !blockwise && text.endsWith('\n'), blockwise);
      } else {
        this.setText(text);
      }
    });
  }
}

export function useVimMonacoPlugin(
  editorRef: React.RefObject<Monaco.editor.IStandaloneCodeEditor>,
  options: { enabled: boolean },
) {
  const vimInstanceRef = useRef<VimMode | null>(null);

  useEffect(() => {
    if (options.enabled) {
      if (!window.monaco) {
        console.error(new Error('window.monaco is not defined'));
        return;
      }

      const vimMonacoCDN = 'https://cdn.jsdelivr.net/npm/vim-monaco@1.0.3/dist/vim-monaco.umd.js';
      getVimMonacoFromCDN(vimMonacoCDN).then(VimMode => {
        if (!editorRef.current) {
          console.error(new Error('editorRef.current is not defined'));
          return;
        }

        const vim = new VimMode(editorRef.current);

        const clipboard = new ClipboardRegister();
        vim.setClipboardRegister(clipboard);
        vim.addEventListener('clipboard', () => clipboard.poke());

        vim.enable();

        vimInstanceRef.current = vim;
      });
    }
  }, []);

  return;

  function getVimMonacoFromCDN(url: string) {
    return new Promise<typeof VimMode>(resolve => {
      require.config({ paths: { 'vim-monaco': url } });
      require(['vim-monaco'], function (module: { VimMode: typeof VimMode }) {
        resolve(module.VimMode);
      });
    });
  }
}
