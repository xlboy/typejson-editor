import type { TypeJsonEditorProps, TypeJsonFile } from '@typejson-editor/editor';

type CompressedJsonString = string;

export interface TypeJsonEditorFormFieldValue<Result = unknown> {
  /**
   * 压缩的 `TypeJsonFile[]` 文件源
   *
   * @description 包含多个 `TypeJsonFile` 文件内容的压缩字符串
   * @example
   * import { compress } from 'some-compression-library';
   *
   * const files: TypeJsonFile[] = [
   *   { name: 'index.ts', content: 'export default Math.abs(-1);' },
   *   // ... 其他文件
   * ];
   * source === compress(JSON.stringify(files))
   */
  source: CompressedJsonString;
  /**
   * Editor 执行结果（执行 `index.ts` 文件后得到的默认导出结果）
   *
   * @example
   * // 假设 index.ts 的内容如下：
   * export default Math.abs(-1);
   * // 则 result 的值为：
   * // result === 1
   */
  result: Result;
}

export interface TypeJsonEditorFormFieldProps {
  value?: TypeJsonEditorFormFieldValue;
  onChange?: (value: TypeJsonEditorFormFieldValue) => void;
  /** @default 'blur' */
  onChangeMode?: 'blur' | 'change';
  editorProps: Omit<TypeJsonEditorProps, 'initialFiles' | 'initialActiveFile' | 'fileRef'>;
  /**
   * @default 'index.ts'
   */
  initialActiveFile?: TypeJsonFile['path'];
  actionRef?: React.RefObject<TypeJsonEditorFormFieldActionAPI>;
}

export type ValidationDetails =
  | { type: 'success' }
  | { type: 'warning:running' }
  | { type: 'error:run-failure'; error: Error }
  | { type: 'error:type-check-failure'; errors: string[] }
  | { type: 'error:syntactic-check-failure'; errors: string[] };

export interface TypeJsonEditorFormFieldActionAPI {
  run<Result = unknown>(): Promise<TypeJsonEditorFormFieldValue<Result>>;
  validate(): Promise<boolean>;
  validateDetailed(): Promise<ValidationDetails>;
}
