import type { TypeJsonEditorProps, TypeJsonFile } from '@typejson-editor/editor';

/**
 * @example
 * import { compressToBase64 } from 'lz-string';
 *
 * const files = [
 *   { name: 'index.ts', content: 'export default Math.abs(-1);' },
 * ];
 * result = compressToBase64(JSON.stringify(files))
 */
type CompressedJsonString = string;

export interface TypeJsonEditorFormFieldValue<Result = unknown> {
  /**
   * 预设文件源（压缩格式的 `TypeJsonFile[]`）
   *
   * 用于存放配置所需的依赖文件，如：
   * - 类型定义文件
   * - 工具函数
   * - 其他辅助代码
   */
  preset?: CompressedJsonString;
  /**
   * 用户编辑的文件源（压缩格式的 `TypeJsonFile[]`）
   *
   * 存放实际需要编辑的代码内容
   *
   * @default
   * [{ path: '/index.ts', content: '' }]
   */
  source: CompressedJsonString;
  /**
   * Editor 执行结果（执行 `index.ts` 文件后得到的默认导出结果）
   *
   * @example
   * // 假设 index.ts 的内容如下：
   * export default Math.abs(-1);
   * // 则 result 的值为 1
   */
  result: Result;
}

export interface TypeJsonEditorFormFieldProps {
  value?: TypeJsonEditorFormFieldValue;
  onChange?: (value: TypeJsonEditorFormFieldValue) => void;
  /** @default 'blur' */
  onChangeMode?: 'blur' | 'change';
  editorProps: Omit<
    TypeJsonEditorProps,
    'initialFiles' | 'initialActiveFile' | 'fileRef'
  >;
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
  | { type: 'error:runner-init-failure'; error: Error }
  | { type: 'error:type-check-failure'; errors: string[] }
  | { type: 'error:syntactic-check-failure'; errors: string[] };

export interface TypeJsonEditorFormFieldActionAPI {
  run<Result = unknown>(): Promise<TypeJsonEditorFormFieldValue<Result>>;
  validate(): Promise<boolean>;
  validateDetailed(): Promise<ValidationDetails>;
}
