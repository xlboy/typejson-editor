import { TypeAcquisitionMonacoPluginOptions } from './hooks/monaco/use-type-acquisition.plugin';
import type * as Monaco from 'monaco-editor';

/**
 * 表示一个标准化的文件路径。
 *
 * 所有路径都统一使用正斜杠（'/'）作为分隔符。
 *
 * 相对路径如 `'./file.ts'`、`'/file.ts'` 或 `'file.ts'` 都会被转换为绝对路径形式 `'/file.ts'`。
 */
export type NormalizedPath = string;

export interface TypeJsonEditorProps {
  monaco: typeof Monaco;
  className?: string;
  styles?: React.CSSProperties;
  fileRef?: React.RefObject<TypeJsonEditorFileAPI>;
  validationRef?: React.RefObject<TypeJsonEditorValidationAPI>;
  onCreated?: (editor: Monaco.editor.IStandaloneCodeEditor) => void;
  editorOptions?: Monaco.editor.IStandaloneEditorConstructionOptions;
  initialFiles?: TypeJsonFile[];
  initialActiveFile?: TypeJsonFile['path'];
  onActiveFileChange?: (path: string, fileModel: Monaco.editor.ITextModel) => void;
  onActiveFileContentChange?: (path: string, content: string) => void;
  plugins?: {
    /**
     * @default { enabled: true }
     */
    twoslashInlay?: { enabled: boolean };
    /**
     * @default { enabled: false }
     * 如果开启，则需传 `ts` 依赖项；如不传，则自动从 jsdelivr-cdn 中加载
     */
    typeAcquisition?:
      | Pick<TypeAcquisitionMonacoPluginOptions & { enabled: true }, 'enabled' | 'ts'>
      | Pick<TypeAcquisitionMonacoPluginOptions & { enabled: false }, 'enabled'>;
    /**
     * @default { enabled: false }
     */
    vim?: { enabled: boolean };
  };
}

export interface TypeJsonEditorFileAPI {
  getActive: () => [TypeJsonFile, Monaco.editor.ITextModel] | null;
  setActive: (path: string) => void;
  get: (path: string) => [TypeJsonFile, Monaco.editor.ITextModel] | null;
  getAll: () => [TypeJsonFile, Monaco.editor.ITextModel][];
  update: (file: TypeJsonFile) => void;
  updateOrAddMultiple: (files: TypeJsonFile[]) => void;
  add: (file: TypeJsonFile, isActive?: boolean) => void;
  addMultiple: (files: TypeJsonFile[]) => void;
  remove: (path: string) => void;
  clear: () => void;
}

export type Diagnostic = Monaco.languages.typescript.Diagnostic & { lineNumber: number; column: number };

export interface TypeJsonEditorValidationAPI {
  hasErrors: () => Promise<boolean>;
  getErrors: () => Promise<{
    typeErrors: Diagnostic[];
    syntacticErrors: Diagnostic[];
  }>;
}

export interface TypeJsonFile {
  /**
   * @example
   * '/file.ts';
   * './file.ts';
   * 'file.ts'
   */
  path: string;
  content: string;
  readOnly?: boolean;
  /**
   * eg: node_modules
   */
  isExternal?: boolean;
}
